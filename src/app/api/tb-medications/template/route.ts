import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const header = '"Hari Ke","Tanggal","Jam Minum","Nama Obat","Dosis","Metode Pemberian","Status","Catatan Khusus"\n';
  
  // Provide sample starter template rows for 6 months (180 days)
  let csvContent = header;
  csvContent += '"1","05-08-2026","07:00","OAT KDT Anak","2 Tablet","Cup feeder + air putih + sirplus","Selesai","~50%"\n';
  csvContent += '"2","06-08-2026","06:50","OAT KDT Anak","2 Tablet","Spuit + air putih","Selesai","~80%"\n';
  csvContent += '"3","07-08-2026","06:15","OAT KDT Anak","2 Tablet","Spuit + air putih","Selesai","~90%"\n';
  csvContent += '"4","08-08-2026","06:30","OAT KDT Anak","2 Tablet","Spuit + air putih","Selesai","~100%"\n';
  csvContent += '"5","09-08-2026","","OAT KDT Anak","2 Tablet","Spuit + air putih","-","-"\n';

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="template_minum_obat_tb.csv"',
    },
  });
}
