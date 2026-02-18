// 취소 영수증
// 새 창을 열고(head/body를 DOM API로 구성) -> print() 호출
import { notify } from "shared/ui/notify";

export function printCancellation(cancel) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    notify.error("팝업이 차단되었습니다. 브라우저 팝업 허용을 확인해주세요.");
    return;
  }

  const doc = win.document;

  // <head>
  const head = doc.createElement("head");
  const meta = doc.createElement("meta");
  meta.setAttribute("charset", "utf-8");
  const title = doc.createElement("title");
  title.textContent = `취소 영수증 - ${cancel.cancellationId || cancel.cancelNo || ""}`;
  const style = doc.createElement("style");
  style.textContent = `
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",sans-serif;padding:24px}
    h1{font-size:18px;margin:0 0 12px}
    table{border-collapse:collapse;width:100%;margin-top:12px}
    td,th{border:1px solid #ddd;padding:8px;font-size:12px}
    .right{text-align:right}
  `;
  head.appendChild(meta);
  head.appendChild(title);
  head.appendChild(style);

  const body = doc.createElement("body");
  const h1 = doc.createElement("h1");
  h1.textContent = "취소 영수증";

  const metaWrap = doc.createElement("div");
  metaWrap.innerHTML = `
    <div>취소번호: ${cancel.cancellationId || cancel.cancelNo || "-"}</div>
    <div>취소일시: ${cancel.createdAt || "-"}</div>
    <div>사유: ${cancel.reason || "-"}</div>
  `;

  const table = doc.createElement("table");
  const thead = doc.createElement("thead");
  thead.innerHTML = `<tr><th>상품</th><th class="right">수량</th><th class="right">환불금액</th></tr>`;
  const tbody = doc.createElement("tbody");

  (cancel.items || []).forEach((it) => {
    const tr = doc.createElement("tr");
    const tdName = doc.createElement("td");
    tdName.textContent = it.name || "-";
    const tdQty = doc.createElement("td");
    tdQty.className = "right";
    tdQty.textContent = String(it.qty || 0);
    const tdRefund = doc.createElement("td");
    tdRefund.className = "right";
    tdRefund.textContent = `${(it.refund || 0).toLocaleString()}원`;
    tr.appendChild(tdName);
    tr.appendChild(tdQty);
    tr.appendChild(tdRefund);
    tbody.appendChild(tr);
  });

  const tfoot = doc.createElement("tfoot");
  const sum = (cancel.amount || cancel.refundTotal || 0).toLocaleString();
  tfoot.innerHTML = `<tr><th colspan="2" class="right">합계</th><th class="right">${sum}원</th></tr>`;

  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);

  const note = doc.createElement("p");
  note.style.cssText = "margin-top:16px;font-size:12px;color:#666";
  note.textContent = "* 무통장 환불의 경우 영업일 기준 반영까지 시간이 소요될 수 있습니다.";

  const html = doc.createElement("html");
  html.appendChild(head);
  body.appendChild(h1);
  body.appendChild(metaWrap);
  body.appendChild(table);
  body.appendChild(note);
  html.appendChild(body);
  doc.replaceChildren(html);

  // 인쇄
  // 일부 브라우저는 렌더링 이후 print가 안전함
  setTimeout(() => {
    win.focus();
    win.print();
    setTimeout(() => win.close(), 400);
  }, 100);
}
