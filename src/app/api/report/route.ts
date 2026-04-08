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
      return NextResponse.json({ error: "ANAF indisponibil" }, { status: 502 });
    }

    const data = await anafRes.json();
    if (!data.found || data.found.length === 0) {
      return NextResponse.json({ error: "CUI negăsit" }, { status: 404 });
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
    const riskLabel = risk <= 30 ? "Risc Scăzut" : risk <= 60 ? "Atenție" : "Risc Ridicat";
    const riskColor = risk <= 30 ? "#059669" : risk <= 60 ? "#d97706" : "#dc2626";
    const riskBg = risk <= 30 ? "#ecfdf5" : risk <= 60 ? "#fffbeb" : "#fef2f2";

    const ok = (val: boolean) => val
      ? '<span style="color:#059669;font-weight:800">✓ DA</span>'
      : '<span style="color:#dc2626;font-weight:800">✗ NU</span>';

    const fd = (d: string | null | undefined) => {
      if (!d || d === " " || d === "") return "—";
      try {
        const x = new Date(d);
        if (isNaN(x.getTime())) return d;
        const m = ["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","nov","dec"];
        return `${x.getDate()} ${m[x.getMonth()]} ${x.getFullYear()}`;
      } catch { return d; }
    };

    const now = new Date();
    const months = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];
    const timestamp = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

    const html = `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<title>Raport Fiscal — ${g.denumire || cui}</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a2e; font-size: 11pt; line-height: 1.5; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 3px solid #002B7F; margin-bottom: 20px; }
  .logo { font-size: 18pt; font-weight: 900; color: #002B7F; letter-spacing: -0.02em; }
  .logo-sub { font-size: 7pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
  .timestamp { font-size: 8pt; color: #94a3b8; text-align: right; }
  .company-name { font-size: 20pt; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
  .company-meta { font-size: 10pt; color: #64748b; margin-bottom: 20px; }
  .cui-badge { display: inline-block; background: #eef2ff; color: #002B7F; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-family: monospace; font-size: 10pt; border: 1px solid #c7d2fe; }
  .risk-box { padding: 16px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
  .risk-score { font-size: 28pt; font-weight: 900; }
  .risk-label { font-size: 12pt; font-weight: 800; }
  .risk-desc { font-size: 9pt; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { text-align: left; padding: 10px 14px; background: #f8fafc; color: #475569; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; border-bottom: 2px solid #e2e8f0; }
  td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 10pt; }
  td:first-child { font-weight: 700; color: #334155; width: 35%; }
  .status-row td { background: #fafbfc; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #94a3b8; text-align: center; }
  .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 8pt; color: #92400e; margin-top: 16px; margin-bottom: 16px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo">CUI Check</div>
    <div class="logo-sub">Verificare Fiscală România</div>
  </div>
  <div class="timestamp">
    Raport generat: ${timestamp}<br>
    Sursa: ANAF (webservicesp.anaf.ro)
  </div>
</div>

<div class="company-name">${g.denumire || "N/A"}</div>
<div class="company-meta">
  <span class="cui-badge">CUI ${g.cui || cui}</span> &nbsp;
  ${g.nrRegCom || ""} &nbsp; ${g.adresa || ""}
</div>

<div class="risk-box" style="background:${riskBg};border:1px solid ${riskColor}22">
  <div class="risk-score" style="color:${riskColor}">${risk}/100</div>
  <div>
    <div class="risk-label" style="color:${riskColor}">${riskLabel}</div>
    <div class="risk-desc">${risk <= 30 ? "Toate verificările sunt în regulă" : risk <= 60 ? "Unele aspecte necesită atenție suplimentară" : "Multiple probleme identificate — nu recomandăm tranzacții"}</div>
  </div>
</div>

<table>
  <thead>
    <tr><th>Verificare</th><th>Status</th><th>Detalii</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Status TVA (Art. 316)</td>
      <td>${ok(tvaActive)}</td>
      <td>${tvaActive ? "Înregistrat din " + fd(lastPeriod?.data_inceput_ScpTVA) : "Neînregistrat în scopuri de TVA" + (lastPeriod?.data_sfarsit_ScpTVA && lastPeriod.data_sfarsit_ScpTVA.trim() ? " — radiat " + fd(lastPeriod.data_sfarsit_ScpTVA) : "")}</td>
    </tr>
    <tr class="status-row">
      <td>Contribuabil Activ</td>
      <td>${ok(!isInactive)}</td>
      <td>${isInactive ? "INACTIV" + (si.dataInactivare && si.dataInactivare.trim() ? " din " + fd(si.dataInactivare) : "") : "Activ fiscal — fără restricții"}</td>
    </tr>
    <tr>
      <td>RO e-Factura</td>
      <td>${ok(hasEfact)}</td>
      <td>${hasEfact ? "Înregistrat" + (g.data_inreg_Reg_RO_e_Factura && g.data_inreg_Reg_RO_e_Factura.trim() ? " din " + fd(g.data_inreg_Reg_RO_e_Factura) : "") : "Neînregistrat în RO e-Factura"}</td>
    </tr>
    <tr class="status-row">
      <td>TVA la Încasare</td>
      <td>${ok(!hasTvaInc)}</td>
      <td>${hasTvaInc ? "Aplică TVA la încasare" + (ti.dataInceputTvaInc && ti.dataInceputTvaInc.trim() ? " din " + fd(ti.dataInceputTvaInc) : "") : "Nu aplică — regim normal"}</td>
    </tr>
    <tr>
      <td>Plata Defalcată TVA</td>
      <td>${ok(!hasSplit)}</td>
      <td>${hasSplit ? "Înscris în plata defalcată" : "Nu aplică split TVA"}</td>
    </tr>
    <tr class="status-row">
      <td>Stare Înregistrare</td>
      <td></td>
      <td>${g.stare_inregistrare || "—"}</td>
    </tr>
    <tr>
      <td>Data Înregistrare</td>
      <td></td>
      <td>${fd(g.data_inregistrare)}</td>
    </tr>
    <tr class="status-row">
      <td>Cod CAEN</td>
      <td></td>
      <td>${g.cod_CAEN || "—"}</td>
    </tr>
    <tr>
      <td>Organ Fiscal</td>
      <td></td>
      <td>${g.organFiscalCompetent || "—"}</td>
    </tr>
    <tr class="status-row">
      <td>Formă Juridică</td>
      <td></td>
      <td>${g.forma_juridica || "—"}</td>
    </tr>
  </tbody>
</table>

<div class="disclaimer">
  ⚠️ Datele sunt preluate live din surse oficiale ANAF (webservicesp.anaf.ro). Acest raport nu înlocuiește consultanța fiscală profesională. Verificați întotdeauna informațiile cu un consultant autorizat înainte de a lua decizii comerciale.
</div>

<div class="footer">
  CUI Check — Verificare Fiscală România • cuicheck.ro • Raport generat automat la ${timestamp} • Built by Adrian Stanese
</div>

<script>window.onload=function(){window.print()}</script></body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="Raport_Fiscal_CUI_${cui}.html"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Eroare generare raport" }, { status: 500 });
  }
}
