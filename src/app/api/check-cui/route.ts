import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cui = request.nextUrl.searchParams.get("cui");

  if (!cui || !/^\d{1,10}$/.test(cui)) {
    return NextResponse.json({ error: "CUI invalid" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0]; // "2026-04-08"

  try {
    const anafRes = await fetch(
      "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ cui: parseInt(cui, 10), data: today }]),
      }
    );

    if (!anafRes.ok) {
      return NextResponse.json(
        { error: "ANAF momentan indisponibil. Reîncearcă în 30 secunde." },
        { status: 502 }
      );
    }

    const data = await anafRes.json();

    if (data.cod !== 200 || !data.found || data.found.length === 0) {
      // Check notFound
      if (data.notfound && data.notfound.length > 0) {
        return NextResponse.json(
          { error: `CUI ${cui} nu a fost găsit în baza de date ANAF.` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Niciun rezultat găsit pentru acest CUI." },
        { status: 404 }
      );
    }

    const r = data.found[0];

    // Calculate risk score based on flags
    let risk = 0;
    if (!r.scpTVA) risk += 15;
    if (r.statusInactivi === true) risk += 30;
    if (!r.statusRO_e_Factura) risk += 20;
    if (r.TVA_incasare === true) risk += 10;
    if (r.splitTVA === true) risk += 5;
    // stare_inregistrare check
    if (r.stare_inregistrare && r.stare_inregistrare.toLowerCase().includes("inactiv")) {
      risk += 20;
    }

    risk = Math.min(risk, 100);

    const result = {
      cui: String(r.cui),
      den: r.denumire || `CUI ${r.cui}`,
      reg: r.nrRegCom || "—",
      adr: r.adresa || "—",
      inm: r.data_inceput_ScpTVA || null,

      // TVA status
      tva: r.scpTVA === true,
      dtva: r.data_inceput_ScpTVA || null,
      drad: r.data_sfarsit_ScpTVA || null,

      // Inactive
      inact: r.statusInactivi === true,
      dinact: r.data_inactivare || null,

      // RO e-Factura
      efact: r.statusRO_e_Factura === true,
      defact: r.dataInceputRO_e_Factura || null,

      // TVA la incasare
      tvainc: r.TVA_incasare === true,
      tvaincP: r.dataInceputTvaInc && r.dataSfarsitTvaInc
        ? `${r.dataInceputTvaInc} – ${r.dataSfarsitTvaInc}`
        : r.dataInceputTvaInc
        ? `din ${r.dataInceputTvaInc}`
        : undefined,

      // Split TVA
      split: r.splitTVA === true,

      // BPI - not available from this ANAF endpoint
      bpi: false,
      bpiText: undefined,

      // Risk score
      risk,

      // Raw registration status
      stare: r.stare_inregistrare || null,

      // Timestamp
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("ANAF API error:", err);
    return NextResponse.json(
      { error: "Eroare la conectarea cu ANAF. Reîncearcă mai târziu." },
      { status: 502 }
    );
  }
}
