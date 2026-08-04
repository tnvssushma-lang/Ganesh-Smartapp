let extractedText = "";


// Display selected bill image
document.getElementById("billImage").addEventListener("change", function () {

    const file = this.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function (e) {

            document.getElementById("preview").src = e.target.result;

        };

        reader.readAsDataURL(file);
    }

});


// Read bill
async function uploadBill() {

    const file = document.getElementById("billImage").files[0];


    if (!file) {

        alert("Please select a bill image");

        return;

    }


    document.getElementById("status").innerText =
        "Processing bill... Please wait";


    try {


        const enhancedImage = await enhanceImage(file);



        const result = await Tesseract.recognize(

            enhancedImage,

            "eng+hin",

            {

                logger: function (data) {

                    if (data.status) {

                        document.getElementById("status").innerText =
                            data.status +
                            " " +
                            Math.round(data.progress * 100) +
                            "%";

                    }

                }

            }

        );



        extractedText = formatText(result.data.text);



        document.getElementById("billText").value =
            extractedText;



        document.getElementById("status").innerText =
            "Bill reading completed";


    }


    catch(error) {


        console.log(error);


        document.getElementById("status").innerText =
            "Error reading bill. Try a clearer image.";


    }


}



// Improve image before OCR

function enhanceImage(file) {


    return new Promise((resolve) => {


        const img = new Image();


        img.src = URL.createObjectURL(file);



        img.onload = function () {



            const canvas =
                document.createElement("canvas");


            const ctx =
                canvas.getContext("2d");



            // Increase resolution

            canvas.width =
                img.width * 3;


            canvas.height =
                img.height * 3;



            ctx.drawImage(

                img,

                0,

                0,

                canvas.width,

                canvas.height

            );



            resolve(

                canvas.toDataURL("image/png")

            );


        };


    });

}



// Clean OCR output

function formatText(text) {


    return text

        .replace(/[|{}<>[\]\\]/g, " ")

        .replace(/\n+/g, "\n")

        .replace(/ +/g, " ")

        .trim();


}



// Export CSV Excel file

function downloadExcel() {


    if (!extractedText) {

        alert("Please read a bill first");

        return;

    }



    const csvContent =
        "Bill Details\n\n" +
        extractedText;



    const blob =
        new Blob(

            [csvContent],

            { type: "text/csv" }

        );



    const url =
        URL.createObjectURL(blob);



    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "SmartBill_Bill_Data.csv";


    link.click();


}
