import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cui = request.nextUrl.searchParams.get("cui");
  if (!cui || !/^\d{1,10}$/.test(cui)) {
    return NextResponse.json({ error: "CUI invalid" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const anafRes = await fetch(
      "https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva",
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

    if (data.notFound && data.notFound.length > 0 && (!data.found || data.found.length === 0)) {
      return NextResponse.json(
        { error: "CUI " + cui + " nu a fost găsit în baza de date ANAF." },
        { status: 404 }
      );
    }

    if (!data.found || data.found.length === 0) {
      return NextResponse.json(
        { error: "Niciun rezultat găsit pentru acest CUI." },
        { status: 404 }
      );
    }

    const f = data.found[0];
    const g = f.date_generale || {};
    const v = f.inregistrare_scop_Tva || {};
    const ti = f.inregistrare_RTVAI || {};
    const si = f.stare_inactiv || {};
    const sp = f.inregistrare_SplitTVA || {};

    const tvaActive = v.scpTVA === true;
    const isInactive = si.statusInactivi === true;
    const hasEfact = g.statusRO_e_Factura === true;
    const hasTvaInc = ti.statusTvaIncasare === true;
    const hasSplit = sp.statusSplitTVA === true;

    let risk = 0;
    if (!tvaActive) risk += 15;
    if (isInactive) risk += 30;
    if (!hasEfact) risk += 20;
    if (hasTvaInc) risk += 10;
    if (hasSplit) risk += 5;
    if (g.stare_inregistrare && g.stare_inregistrare.toLowerCase().includes("radiat")) risk += 20;
    risk = Math.min(risk, 100);

    const periods = v.perioade_TVA || [];
    const lastPeriod = periods.length > 0 ? periods[periods.length - 1] : null;

    const result = {
      cui: String(g.cui || cui),
      den: g.denumire || "CUI " + cui,
      reg: g.nrRegCom || "—",
      adr: g.adresa || "—",
      inm: g.data_inregistrare || null,
      tva: tvaActive,
      dtva: lastPeriod ? lastPeriod.data_inceput_ScpTVA || null : null,
      drad: lastPeriod ? lastPeriod.data_sfarsit_ScpTVA || null : null,
      inact: isInactive,
      dinact: si.dataInactivare || null,
      efact: hasEfact,
      defact: g.data_inreg_Reg_RO_e_Factura || null,
      tvainc: hasTvaInc,
      tvaincP: ti.dataInceputTvaInc && ti.dataInceputTvaInc.trim()
        ? "din " + ti.dataInceputTvaInc + (ti.dataSfarsitTvaInc && ti.dataSfarsitTvaInc.trim() ? " până la " + ti.dataSfarsitTvaInc : "")
        : undefined,
      split: hasSplit,
      bpi: false,
      bpiText: undefined,
      risk,
      stare: g.stare_inregistrare || null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("ANAF API error:", err);
    return NextResponse.json(
      { error: "Eroare la conectarea cu ANAF. Reîncearcă mai târziu." },
      { status: 502 }
    );
  }
}
