/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable linebreak-style */
/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable linebreak-style */
$('#menu-btn').click(() => {
  $('#menu').toggleClass('active');
});
$(document).ready(() => {
  $('#today-table').DataTable();
});
$(document).ready(() => {
  $('#month-table').DataTable();
});
$(document).ready(() => {
  $('#year-table').DataTable();
});

function CreatePDFfromHTML(id) {
  const HTML_Width = $(`#${id}`).width();
  const HTML_Height = $(`#${id}`).height();
  const top_left_margin = 15;
  const PDF_Width = HTML_Width + top_left_margin * 2;
  const PDF_Height = PDF_Width * 1.5 + top_left_margin * 2;
  const canvas_image_width = HTML_Width;
  const canvas_image_height = HTML_Height;
  const totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
  html2canvas($(`#${id}`)[0]).then((canvas) => {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
    pdf.addImage(
      imgData,
      'JPG',
      top_left_margin,
      top_left_margin,
      canvas_image_width,
      canvas_image_height,
    );
    for (let i = 1; i <= totalPDFPages; i++) {
      pdf.addPage(PDF_Width, PDF_Height);
      pdf.addImage(
        imgData,
        'JPG',
        top_left_margin,
        -(PDF_Height * i) + top_left_margin * 4,
        canvas_image_width,
        canvas_image_height,
      );
    }
    pdf.save(
      'Sales_Report.pdf',
    );
  });
}

function sepDate(value) {
  $.ajax({
    url: '/admin/salesreport/customdate',
    data: {
      date: value,
    },
    method: 'post',
    success: (res) => {
      // document.getElementById('quantity').innerText = Number(qty) + Number(count);
      this.reload();
      // $('#quantity').load(`${document.URL} #quantity`);
    },
  });
}
