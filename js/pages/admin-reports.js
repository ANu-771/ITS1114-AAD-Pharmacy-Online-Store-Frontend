/**
 * KK PHARMACY ONLINE PHARMACY - ADMIN REPORTS CONTROLLER (js/pages/admin-reports.js)
 * Manages Jasper report exports, CSV generation simulations, and audit filters.
 */
const AdminReportsPage = {
  init: () => {
    AdminSidebarComponent.render('reports');
    AdminReportsPage.attachListeners();
  },

  attachListeners: () => {
    // Regenerate report
    document.getElementById('btnRunReport')?.addEventListener('click', () => {
      const period = document.getElementById('reportPeriodSelect').value;
      const dept = document.getElementById('reportDeptSelect').value;
      Toast.show(`Analytics regenerated for [${period.toUpperCase()}] department: [${dept.toUpperCase()}]`, 'success');
    });

    // Export Jasper PDF
    document.getElementById('btnExportJasperPDF')?.addEventListener('click', () => {
      Toast.show('Generating Jasper Reports compiled PDF export...', 'info');
      setTimeout(() => {
        Toast.show('KK_PHARMACY_Executive_Report_2026.pdf prepared! Printing dialog opened.', 'success');
        window.print();
      }, 1000);
    });

    // Export CSV
    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Rank,Product Name,Category,Units Sold,Avg Price,Total Revenue\n"
        + "1,Digital Blood Pressure Monitor,Medical Equipment,14,14850.00,207900.00\n"
        + "2,Paracetamol Extra Strength 500mg,Medicines,78,480.00,37440.00\n"
        + "3,Daily Multivitamin 60s,Vitamins,7,3200.00,22400.00\n"
        + "4,Amoxicillin 500mg Capsules,Medicines,16,650.00,10400.00\n"
        + "5,Pulse Oximeter OLED,Medical Equipment,2,4950.00,9900.00\n";

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "medora_sales_audit_2026.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Toast.show('CSV audit spreadsheet downloaded successfully!', 'success');
    });
  }
};
