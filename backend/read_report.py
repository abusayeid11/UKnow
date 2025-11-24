import PyPDF2
import os

def read_pdf_report():
    pdf_path = "../Deep_Learning_Project_Report.pdf"
    
    if not os.path.exists(pdf_path):
        print("PDF file not found at:", pdf_path)
        return
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"Total pages: {len(pdf_reader.pages)}")
            print("=" * 80)
            
            full_text = ""
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                print(f"\n--- PAGE {page_num + 1} ---")
                print(text)
                print("-" * 50)
                full_text += text + "\n"
            
            # Save to a text file for easier reading
            with open("report_content.txt", "w", encoding="utf-8") as output_file:
                output_file.write(full_text)
            
            print(f"\nReport content saved to 'report_content.txt'")
            
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    read_pdf_report()
