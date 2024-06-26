from openpyxl import load_workbook
from openpyxl.styles import PatternFill, NamedStyle,Border, Side, Alignment, Font
from flask import Flask, request, jsonify, send_file
import subprocess
import os
import json
import logging


app = Flask(__name__)

@app.route('/create-excel', methods=['POST'])
def main_excel():
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        used_data = json.loads(request.json)
        app.logger.info(used_data)
        wb = load_workbook(filename='./test.ods')
        ws = wb.active
        ws.page_setup.orientation = ws.ORIENTATION_LANDSCAPE
        ws.page_setup.paperSize = ws.PAPERSIZE_TABLOID
        ws.page_setup.fitToHeight = 0
        ws.page_setup.fitToWidth = 1
        ws = add_header(ws, used_data["year"],
                            used_data["month"], 
                            used_data["name"], 
                            used_data["id"],
                            used_data["mail"],
                            used_data["phone"]
                            )
        ws = add_lines(ws, used_data)
        ws = sum_lines(ws, used_data)
        wb.save("/tmp/result.xlsx")
        subprocess.run(["soffice --headless --convert-to pdf:calc_pdf_Export --outdir /tmp /tmp/result.xlsx"],
                       shell=True,
                       capture_output=True, text=True)
        try:
            return send_file('/tmp/result.pdf', as_attachment=True)
        finally:
            if os.path.exists('/tmp/result.pdf'):
                os.remove('/tmp/result.pdf')
                os.remove('/tmp/result.xlsx')
    else:
        return "Content type is not supported."


def add_header(ws, year, month, name, id, mail, phone):
    ws['C2'] = year
    ws['D2'] = month
    ws['D3'] = name
    ws['D4'] = id
    ws['D5'] = mail
    ws['D6'] = phone
    return ws


def add_lines(ws, rows):
    count = len(rows['rows'])
    total_needed = 23
    empty_border = Border()
    full_border = Border(
        top=Side(style='thin'),
        bottom=Side(style='thin'),
        left=Side(style='thin'),
        right=Side(style='thin'),
    )
    up_down_border = Border(
        top=Side(style='thin'),  # Sadece üst kenarlık
        bottom=Side(style='thin')  # Sadece alt kenarlık
    )
    left_up_down_border = Border(
        top=Side(style='thin'),  # Sadece üst kenarlık
        bottom=Side(style='thin'),  # Sadece alt kenarlık
        left=Side(style='thin')
    )
    right_up_down_border = Border(
        top=Side(style='thin'),  # Sadece üst kenarlık
        bottom=Side(style='thin'),  # Sadece alt kenarlık
        right=Side(style='thin')
    )
    for row in range(9, total_needed + 1):
        for col in range(2, 17):
            cell = ws.cell(row=row, column=col,value=None)
            cell.border = empty_border
            cell.value = None
            cell.fill = PatternFill(start_color="FFFFFFFF", end_color="FFFFFFFF", fill_type="solid")
    start = 9
    for index, row in enumerate(rows['rows']):
        row_values = list(row.values())
        for col in range(2, 17):
            cell = ws.cell(row=start + index, column=col)
            cell.border = full_border
            cell.value = row_values[col - 2]
          
    total = str(count + start + 1)
    number_format = NamedStyle(name="number")
    number_format.number_format = '#,##0.00'
    for column in range(2,17):
        cell = ws.cell(row=int(total),column=column)
        if column == 2:
            cell.value = str(count) + " Tage"
            cell.border = left_up_down_border
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
        elif column == 3:
            cell.border = up_down_border
        elif column == 4:
            cell.value = rows['totals']['workhours']
            cell.style = number_format
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        elif column == 7:
            cell.value = rows['totals']['guests']
            cell.style = number_format
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        elif column == 8:
            cell.value = rows['totals']['breaks']
            cell.style = number_format
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        elif column == 9:
            cell.value = rows['totals']['public_holidays']
            cell.style = number_format
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        elif column == 10:
            cell.value = rows['totals']['sunday_holidays']
            cell.style = number_format
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        elif column == 11:
            cell.value = rows['totals']['midnight_shift']
            cell.style = number_format
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        elif column == 12:
            cell.value = rows['totals']['night_shift']
            cell.style = number_format
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        elif column == 13:
            cell.value = rows['totals']['accomodations']
            cell.fill = PatternFill(start_color="F8EEC7", end_color="F8EEC7", fill_type="solid")
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.font = Font(name='Calibri', size=11, bold=True)
            cell.border = up_down_border
        else:
            cell.border = up_down_border
        if column == 16:
            cell.border = right_up_down_border
    return ws


def write_to_excel(file_path, sheet_name, cell_coordinates, value):
    try:
        wb = load_workbook(filename=file_path)
        sheet = wb[sheet_name]
        sheet[cell_coordinates] = value
        wb.save(file_path)
        print(f"'{value}' değeri başarıyla '{cell_coordinates}' hücresine yazıldı.")
    except Exception as e:
        print("Excel dosyasına yazma işlemi başarısız oldu. Hata:", e)


def color_cell(file_path, sheet_name, cell_coordinates, color):
    try:
        wb = load_workbook(filename=file_path)
        sheet = wb[sheet_name]
        fill = PatternFill(start_color=color, end_color=color, fill_type="solid")
        sheet[cell_coordinates].fill = fill
        wb.save(file_path)
        print(f"'{cell_coordinates}' hücresi başarıyla renklendirildi.")
    except Exception as e:
        print("Excel dosyasında hücre renklendirme işlemi başarısız oldu. Hata:", e)


def sum_lines(ws,used_data):
    ws['E35'].value = str(used_data['totals']['dates']) + " Tage"
    ws['E36'].value = str(used_data['totals']['workhours']) + " St"
    ws['E37'].value = str(used_data['totals']['breaks']) + " St"
    ws['E38'].value = str(used_data['totals']['sub_total']) + " St"
    ws['E39'].value = str(used_data['totals']['night_shift']) + " St"
    ws['E40'].value = str(used_data['totals']['midnight_shift']) + " St"
    ws['E41'].value = str(used_data['totals']['sunday_holidays']) + " St"
    ws['E42'].value = str(used_data['totals']['public_holidays']) + " St"
    ws['E43'].value = str(used_data['totals']['guests']) + " St"
    ws['K35'].value = str(used_data['admin_extra'])
    ws['K36'].value = str(used_data['left_admin_extra'])
    ws['K38'].value = str(used_data['current_sick'])
    ws['K39'].value = str(used_data['rights_sick'])
    ws['K41'].value = str(used_data['used_annual'])
    ws['K42'].value = str(used_data['total_annual'])
    ws['K43'].value = str(used_data['left_annual'])
    ws['O35'].value = str(used_data['total_hours_req'])
    ws['O36'].value = str(used_data['total_worked_time'])
    left_hours = used_data['left_work_time']
    if left_hours > 0:
        ws['O37'].fill = PatternFill(start_color="f01111", end_color="f01111", fill_type="solid")
        ws['O37'].value = '-' + str(used_data['left_work_time'])
    else:
        ws['O37'].value = ' - '
    return ws

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=8000, debug=True)
