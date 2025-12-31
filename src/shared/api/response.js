export function pickData(res) {
  return res?.data;
}

export function pickList(res) {
  return {
    rows: res?.data ?? [],
    meta: res?.meta ?? { page: 1, size: 20, total: 0 },
  };
}
