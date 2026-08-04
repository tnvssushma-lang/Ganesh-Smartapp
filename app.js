let extractedText = "";


function processBill() {

    let file = document.getElementById("billImage").files[0];

    if (!file) {
        alert("Please select a bill image first.");
        return;
    }


    document.getElementById("status").innerHTML =
        "Reading bill... Please wait";


    Tesseract.recognize(
        file,
        'eng',
        {
            logger: function(info) {

                if (info.status === "recognizing text") {

                    let progress = Math.round(info.progress * 100);

                    document.getElementById("status").innerHTML =
                    "Reading bill... " + progress + "%";

                }

            },
             tessedit_pageseg_mode: 6,
    preserve_interword_spaces: true
        }

    ).then(({ data: { text } }) => {


        extractedText = text;


        document.getElementById("billText").value = text;


        document.getElementById("status").innerHTML =
        "Bill reading completed";


    })

    .catch(error => {

        console.log(error);

        document.getElementById("status").innerHTML =
        "Unable to read bill";

    });

}




function exportExcel() {


    if (extractedText === "") {

        alert("Please convert a bill first.");

        return;

    }


    let data = [

        ["SmartBill AI - Extracted Bill"],

        ["Details"],

        [extractedText]

    ];


    let worksheet =
        XLSX.utils.aoa_to_sheet(data);


    let workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Bill Details"
    );


    XLSX.writeFile(
        workbook,
        "SmartBill_Excel.xlsx"
    );

}
