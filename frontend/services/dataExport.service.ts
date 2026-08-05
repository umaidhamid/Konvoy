export const dataExportService = {
  exportUrl: () => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    return `${base}/data-export`;
  },
};
