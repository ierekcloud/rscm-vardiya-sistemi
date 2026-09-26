import ExcelJS from 'exceljs';
import { MonthSummary, StaffMember, Department, GroupId } from '../types';
import { TURKISH_MONTHS, getRotatedStaff, generateMonthSchedule } from './shiftLogic';

/**
 * Seçili ayın vardiya çizelgesini ekrandaki matris ile birebir aynı yapıda,
 * yan yana sütunlar halinde ve hafta sonları renkli olarak gerçek bir Excel (.xlsx) dosyası olarak dışa aktarır.
 */
export async function exportScheduleToExcel(
  departmentName: string,
  summary: MonthSummary,
  staffList: StaffMember[]
): Promise<void> {
  const monthName = TURKISH_MONTHS[summary.month];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RSMC Vardiya Sistemi';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`${monthName} ${summary.year}`, {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 5 }],
    properties: { defaultRowHeight: 22 }
  });

  const totalDays = summary.shifts.length;

  // 1. Üst Kurumsal Başlık
  const titleRow = worksheet.addRow([
    `RSMC VARDİYA SİSTEMİ - ${departmentName.toUpperCase()} ÇALIŞMA VE NÖBET ÇİZELGESİ`
  ]);
  titleRow.height = 30;
  worksheet.mergeCells(1, 1, 1, totalDays + 7);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate 800
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. Alt Bilgi Satırı
  const infoRow = worksheet.addRow([
    `Dönem: ${monthName} ${summary.year}  |  Birim: ${departmentName}  |  Personel: ${staffList.length} Kişi  |  Aylık Hedef: ${summary.targetWorkingDays} Gün (1 Nöbet = 3 Gün Eşdeğer)`
  ]);
  infoRow.height = 20;
  worksheet.mergeCells(2, 1, 2, totalDays + 7);
  const infoCell = worksheet.getCell(2, 1);
  infoCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF475569' } };
  infoCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' },
  };
  infoCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 3. Boşluk
  worksheet.addRow([]);
  worksheet.getRow(3).height = 8;

  // 4. Tablo Başlıkları (Satır 4: Gün Numaraları, Satır 5: Gün İsimleri)
  const headerRow1Values = ['Personel Adı Soyadı', 'Grup'];
  const headerRow2Values = ['', ''];

  summary.shifts.forEach((shift) => {
    headerRow1Values.push(String(shift.dayNumber));
    headerRow2Values.push(shift.dayName.slice(0, 3).toUpperCase());
  });

  headerRow1Values.push('Önc. Devir', 'Nöbet Sayısı', 'Eşdeğer Gün', 'Aylık Hedef', 'Net Bakiye');
  headerRow2Values.push('(Gün)', '(24s)', '(x3 Gün)', '(Hedef)', '(Devir)');

  const row4 = worksheet.addRow(headerRow1Values);
  const row5 = worksheet.addRow(headerRow2Values);
  row4.height = 22;
  row5.height = 18;

  // Personel Adı ve Grup başlıklarını dikey birleştir (Row 4 & 5)
  worksheet.mergeCells(4, 1, 5, 1);
  worksheet.mergeCells(4, 2, 5, 2);

  // Özet sütun başlıklarını da dikey birleştir (Row 4 & 5)
  const summaryColStartIndex = totalDays + 3;
  for (let c = 0; c < 5; c++) {
    worksheet.mergeCells(4, summaryColStartIndex + c, 5, summaryColStartIndex + c);
  }

  // Kenarlık Stili
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  const headerBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'medium', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'medium', color: { argb: 'FF94A3B8' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  // Başlık hücrelerini stillendir
  for (let colIdx = 1; colIdx <= headerRow1Values.length; colIdx++) {
    const cell4 = row4.getCell(colIdx);
    const cell5 = row5.getCell(colIdx);

    cell4.border = headerBorder;
    cell5.border = headerBorder;

    if (colIdx === 1) {
      // Personel Adı
      cell4.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell4.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    } else if (colIdx === 2) {
      // Grup
      cell4.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell4.alignment = { vertical: 'middle', horizontal: 'center' };
    } else if (colIdx >= 3 && colIdx <= totalDays + 2) {
      // Gün Sütunları
      const dayIndex = colIdx - 3;
      const shift = summary.shifts[dayIndex];
      const isWeekend = Boolean(shift.isWeekend);

      if (isWeekend) {
        // HAFTA SONU BAŞLIK RENKLENDİRMESİ (Canlı Altın Sarısı / Amber - Çok Belirgin)
        cell4.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF7C2D12' } }; // Koyu Amber
        cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD54F' } }; // Canlı Altın Sarısı
        cell4.alignment = { vertical: 'middle', horizontal: 'center' };

        cell5.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: 'FF9A3412' } };
        cell5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD54F' } };
        cell5.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        // Hafta İçi
        cell4.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF1E293B' } };
        cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell4.alignment = { vertical: 'middle', horizontal: 'center' };

        cell5.font = { name: 'Segoe UI', size: 8, bold: false, color: { argb: 'FF64748B' } };
        cell5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell5.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    } else {
      // Özet Sütunları
      cell4.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
      cell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell4.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
  }

  // 5. Personel Satırları
  staffList.forEach((staff, staffIdx) => {
    const stats = summary.staffStats[staff.id];
    const rowValues: (string | number)[] = [staff.name, staff.groupId];

    // Günlük Değerler (ABC, X, -)
    summary.shifts.forEach((shift) => {
      const isDuty =
        shift.dutyStaff.some((m) => m.id === staff.id) ||
        (shift.supportStaff ? shift.supportStaff.some((m) => m.id === staff.id) : false);
      const isLeave = shift.leaves ? shift.leaves.some((l) => l.staff.id === staff.id) : false;

      if (isLeave) {
        rowValues.push('X');
      } else if (isDuty) {
        rowValues.push('ABC');
      } else {
        rowValues.push('-');
      }
    });

    // Özet Bakiye Değerleri
    const prevCarry = stats ? stats.previousCarryoverDays : 0;
    const totalDuties = stats ? stats.totalDuties : 0;
    const equivDays = stats ? stats.equivalentWorkDays : 0;
    const targetDays = stats ? stats.targetWorkDays : summary.targetWorkingDays;
    const netBal = stats ? stats.netBalanceDays : 0;

    rowValues.push(prevCarry);
    rowValues.push(totalDuties);
    rowValues.push(equivDays);
    rowValues.push(targetDays);

    let netText = '0 (Denk)';
    if (netBal > 0) netText = `+${netBal} (Alacak)`;
    else if (netBal < 0) netText = `${netBal} (Borç)`;
    rowValues.push(netText);

    const dataRow = worksheet.addRow(rowValues);
    dataRow.height = 21;

    // Satır Zebra Deseni
    const isEven = staffIdx % 2 === 0;
    const baseRowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    for (let cIdx = 1; cIdx <= rowValues.length; cIdx++) {
      const cell = dataRow.getCell(cIdx);
      cell.border = thinBorder;

      if (cIdx === 1) {
        // Personel Adı
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseRowBg } };
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      } else if (cIdx === 2) {
        // Grup
        const grpColor =
          staff.groupId === 'A'
            ? 'FF2563EB'
            : staff.groupId === 'B'
            ? 'FF059669'
            : staff.groupId === 'C'
            ? 'FFD97706'
            : 'FF7C3AED';
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: grpColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseRowBg } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (cIdx >= 3 && cIdx <= totalDays + 2) {
        // Günlük Vardiya Hücreleri
        const dayIdx = cIdx - 3;
        const shift = summary.shifts[dayIdx];
        const isWeekend = Boolean(shift.isWeekend);
        const val = cell.value;

        if (val === 'ABC') {
          // ABC NÖBETİ (Canlı Kurumsal İndigo / Mavi)
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isWeekend ? 'FF2563EB' : 'FF4F46E5' }, // Hafta sonu daha belirgin mavi
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (val === 'X') {
          // İZİN / RAPOR (Amber / Turuncu)
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF92400E' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          // Boş Gün (-)
          if (isWeekend) {
            // HAFTA SONU BELİRGİN PASTEL ALTIN / AMBER VURGUSU
            cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF92400E' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } }; // Canlı Açık Altın Sarısı
          } else {
            cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF94A3B8' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseRowBg } };
          }
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      } else if (cIdx === totalDays + 3) {
        // Önc. Devir
        cell.font = { name: 'Segoe UI', size: 9.5, bold: false, color: { argb: 'FF334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (cIdx === totalDays + 4) {
        // Nöbet Sayısı
        cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF1E293B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } }; // Indigo 100
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (cIdx === totalDays + 5) {
        // Eşdeğer Gün
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF334155' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (cIdx === totalDays + 6) {
        // Aylık Hedef
        cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF64748B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseRowBg } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (cIdx === totalDays + 7) {
        // Net Bakiye
        if (netBal > 0) {
          // Alacaklı (Yeşil)
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF065F46' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
        } else if (netBal < 0) {
          // Borçlu (Kırmızı)
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF991B1B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        } else {
          // Denk
          cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF475569' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  // 6. Günlük Nöbetçi Toplamları Satırı (Alt Özet)
  const dutyCountRowValues: (string | number)[] = ['Nöbetçi Personel Sayısı', ''];
  summary.shifts.forEach((shift) => {
    dutyCountRowValues.push(shift.dutyStaff.length + (shift.supportStaff ? shift.supportStaff.length : 0));
  });
  dutyCountRowValues.push('', '', '', '', '');

  const footerRow = worksheet.addRow(dutyCountRowValues);
  footerRow.height = 20;
  worksheet.mergeCells(footerRow.number, 1, footerRow.number, 2);

  for (let cIdx = 1; cIdx <= dutyCountRowValues.length; cIdx++) {
    const cell = footerRow.getCell(cIdx);
    cell.border = headerBorder;
    if (cIdx <= 2) {
      cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF334155' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    } else if (cIdx >= 3 && cIdx <= totalDays + 2) {
      const dayIdx = cIdx - 3;
      const shift = summary.shifts[dayIdx];
      const isWeekend = Boolean(shift.isWeekend);
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: isWeekend ? 'FF92400E' : 'FF1E293B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isWeekend ? 'FFFDE68A' : 'FFF1F5F9' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }
  }

  // 7. Sütun Genişliklerini Ayarla
  worksheet.getColumn(1).width = 24; // Personel Adı
  worksheet.getColumn(2).width = 7.5; // Grup

  for (let d = 3; d <= totalDays + 2; d++) {
    worksheet.getColumn(d).width = 5.2; // Gün Sütunları
  }

  worksheet.getColumn(totalDays + 3).width = 11; // Önc. Devir
  worksheet.getColumn(totalDays + 4).width = 12; // Nöbet Sayısı
  worksheet.getColumn(totalDays + 5).width = 12; // Eşdeğer Gün
  worksheet.getColumn(totalDays + 6).width = 11; // Hedef
  worksheet.getColumn(totalDays + 7).width = 14; // Net Bakiye

  // 8. Dosyayı Tarayıcıda İndir
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeDept = departmentName.replace(/\s+/g, '_');
  link.download = `${safeDept}_${monthName}_${summary.year}_Vardiya_Cizelgesi.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1 Yıllık Planı da aynı şekilde renkli, yan yana matris formatında Excel olarak dışa aktarır.
 */
export async function exportYearlyScheduleToExcel(
  year: number,
  startMonth: number,
  department: Department,
  startGroup?: GroupId
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RSMC Vardiya Sistemi';
  workbook.created = new Date();

  let carryoverBalances: Record<string, number> = {};

  for (let i = 0; i < 12; i++) {
    const currentMonthIndex = (startMonth + i) % 12;
    const currentYear = year + Math.floor((startMonth + i) / 12);
    const monthName = TURKISH_MONTHS[currentMonthIndex];

    const rotatedStaff = getRotatedStaff(department.staff, currentYear, currentMonthIndex, department.shiftModel);

    const summary = generateMonthSchedule(
      currentYear,
      currentMonthIndex,
      undefined,
      rotatedStaff,
      {},
      carryoverBalances,
      undefined,
      true
    );

    // Bir sonraki aya bakiyeleri devret
    const nextBalances: Record<string, number> = {};
    rotatedStaff.forEach((st) => {
      const stat = summary.staffStats[st.id];
      if (stat) {
        nextBalances[st.id] = stat.netBalanceDays;
      }
    });
    carryoverBalances = nextBalances;

    // Her ay için bir sayfa oluştur
    const worksheet = workbook.addWorksheet(`${monthName} ${currentYear}`, {
      views: [{ state: 'frozen', xSplit: 2, ySplit: 5 }],
      properties: { defaultRowHeight: 22 },
    });

    const totalDays = summary.shifts.length;

    // Üst Başlık
    const titleRow = worksheet.addRow([
      `RSMC VARDİYA SİSTEMİ - ${department.name.toUpperCase()} - ${monthName.toUpperCase()} ${currentYear} ÇİZELGESİ`
    ]);
    titleRow.height = 28;
    worksheet.mergeCells(1, 1, 1, totalDays + 7);
    const tCell = worksheet.getCell(1, 1);
    tCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    tCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Alt Bilgi
    const infoRow = worksheet.addRow([
      `Dönem: ${monthName} ${currentYear}  |  Birim: ${department.name}  |  Personel: ${rotatedStaff.length} Kişi  |  Hedef: ${summary.targetWorkingDays} Gün`
    ]);
    infoRow.height = 18;
    worksheet.mergeCells(2, 1, 2, totalDays + 7);
    const iCell = worksheet.getCell(2, 1);
    iCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF475569' } };
    iCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    iCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.addRow([]);
    worksheet.getRow(3).height = 6;

    // Başlıklar
    const h1 = ['Personel Adı Soyadı', 'Grup'];
    const h2 = ['', ''];
    summary.shifts.forEach((s) => {
      h1.push(String(s.dayNumber));
      h2.push(s.dayName.slice(0, 3).toUpperCase());
    });
    h1.push('Önc. Devir', 'Nöbet Sayısı', 'Eşdeğer Gün', 'Aylık Hedef', 'Net Bakiye');
    h2.push('(Gün)', '(24s)', '(x3 Gün)', '(Hedef)', '(Devir)');

    const r4 = worksheet.addRow(h1);
    const r5 = worksheet.addRow(h2);
    r4.height = 20;
    r5.height = 16;

    worksheet.mergeCells(4, 1, 5, 1);
    worksheet.mergeCells(4, 2, 5, 2);
    for (let c = 0; c < 5; c++) {
      worksheet.mergeCells(4, totalDays + 3 + c, 5, totalDays + 3 + c);
    }

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };

    for (let colIdx = 1; colIdx <= h1.length; colIdx++) {
      const c4 = r4.getCell(colIdx);
      const c5 = r5.getCell(colIdx);
      c4.border = thinBorder;
      c5.border = thinBorder;

      if (colIdx <= 2) {
        c4.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
        c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        c4.alignment = { vertical: 'middle', horizontal: colIdx === 1 ? 'left' : 'center', indent: colIdx === 1 ? 1 : 0 };
      } else if (colIdx >= 3 && colIdx <= totalDays + 2) {
        const dIdx = colIdx - 3;
        const shift = summary.shifts[dIdx];
        const isWk = Boolean(shift.isWeekend);

        if (isWk) {
          c4.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF7C2D12' } };
          c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD54F' } }; // Canlı Altın Sarısı
          c4.alignment = { vertical: 'middle', horizontal: 'center' };

          c5.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: 'FF9A3412' } };
          c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD54F' } };
          c5.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          c4.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E293B' } };
          c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          c4.alignment = { vertical: 'middle', horizontal: 'center' };

          c5.font = { name: 'Segoe UI', size: 7.5, color: { argb: 'FF64748B' } };
          c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          c5.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      } else {
        c4.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF1E293B' } };
        c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        c4.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }

    // Personel Satırları
    rotatedStaff.forEach((st, sIdx) => {
      const stats = summary.staffStats[st.id];
      const vals: (string | number)[] = [st.name, st.groupId];

      summary.shifts.forEach((shift) => {
        const isDuty =
          shift.dutyStaff.some((m) => m.id === st.id) ||
          (shift.supportStaff ? shift.supportStaff.some((m) => m.id === st.id) : false);
        const isLeave = shift.leaves ? shift.leaves.some((l) => l.staff.id === st.id) : false;

        if (isLeave) vals.push('X');
        else if (isDuty) vals.push('ABC');
        else vals.push('-');
      });

      const prevCarry = stats ? stats.previousCarryoverDays : 0;
      const totalDuties = stats ? stats.totalDuties : 0;
      const equivDays = stats ? stats.equivalentWorkDays : 0;
      const targetDays = stats ? stats.targetWorkDays : summary.targetWorkingDays;
      const netBal = stats ? stats.netBalanceDays : 0;

      vals.push(prevCarry, totalDuties, equivDays, targetDays);
      vals.push(netBal > 0 ? `+${netBal}` : netBal < 0 ? `${netBal}` : '0');

      const dRow = worksheet.addRow(vals);
      dRow.height = 20;

      const isEven = sIdx % 2 === 0;
      const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

      for (let cIdx = 1; cIdx <= vals.length; cIdx++) {
        const cell = dRow.getCell(cIdx);
        cell.border = thinBorder;

        if (cIdx === 1) {
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (cIdx === 2) {
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (cIdx >= 3 && cIdx <= totalDays + 2) {
          const dIdx = cIdx - 3;
          const shift = summary.shifts[dIdx];
          const isWk = shift.date.getDay() === 0 || shift.date.getDay() === 6;
          const val = cell.value;

          if (val === 'ABC') {
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWk ? 'FF2563EB' : 'FF4F46E5' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else if (val === 'X') {
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF92400E' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            if (isWk) {
              // Hafta Sonu Belirgin Pastel Altın Sarısı
              cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF92400E' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } }; // Açık Altın Sarısı
            } else {
              cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF94A3B8' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        } else {
          cell.font = { name: 'Segoe UI', size: 9, bold: cIdx === totalDays + 4 || cIdx === totalDays + 7, color: { argb: 'FF1E293B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }
    });

    worksheet.getColumn(1).width = 22;
    worksheet.getColumn(2).width = 7;
    for (let d = 3; d <= totalDays + 2; d++) {
      worksheet.getColumn(d).width = 5.2;
    }
    worksheet.getColumn(totalDays + 3).width = 10;
    worksheet.getColumn(totalDays + 4).width = 11;
    worksheet.getColumn(totalDays + 5).width = 11;
    worksheet.getColumn(totalDays + 6).width = 10;
    worksheet.getColumn(totalDays + 7).width = 12;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeDept = department.name.replace(/\s+/g, '_');
  link.download = `${safeDept}_${year}_12_Aylik_Vardiya_Plani.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
