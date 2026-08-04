let extractedText = "";


// Preview uploaded bill image
const billInput = document.getElementById("billImage");
const previewImage = document.getElementById("preview");


if (billInput) {

    billInput.addEventListener("change", function () {

        const file = this.files[0];

        if (file && previewImage) {

            const reader = new FileReader();

            reader.onload = function (e) {

                previewImage.src = e.target.result;

            };

            reader.readAsDataURL(file);

        }

    });

}



// Read Bill Function

async function uploadBill() {


    const file = document.getElementById("billImage").files[0];


    if (!file) {

        alert("Please upload a bill image first");

        return;

    }



    const status =
        document.getElementById("status");


    const output =
        document.getElementById("billText");



    status.innerHTML =
        "Preparing image...";



    try {


        const image =
            await prepareImage(file);



        status.innerHTML =
            "Reading bill...";



        if (typeof Tesseract === "undefined") {

            throw new Error(
                "OCR library not loaded"
            );

        }



        const result =
            await Tesseract.recognize(

                image,

                "eng",

                {

                    logger: function (info) {

                        if (info.status) {

                            status.innerHTML =
                                info.status +
                                " " +
                                Math.round(
                                    info.progress * 100
                                ) +
                                "%";

                        }

                    }

                }

            );



        extractedText =
            cleanOCR(result.data.text);



        output.value =
            extractedText;



        status.innerHTML =
            "Bill reading completed";


    }


    catch(error) {


        console.error(error);


        status.innerHTML =
            "Error: " + error.message;


    }


}




// Image enhancement

function prepareImage(file) {


    return new Promise(function(resolve){


        const img =
            new Image();



        img.onload = function(){


            const canvas =
                document.createElement("canvas");


            const ctx =
                canvas.getContext("2d");



            canvas.width =
                img.width * 2;


            canvas.height =
                img.height * 2;



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



        img.src =
            URL.createObjectURL(file);


    });


}



// Clean OCR text

function cleanOCR(text) {


    return text

        .replace(/[|{}<>[\]\\]/g, " ")

        .replace(/\n\s*\n/g, "\n")

        .trim();


}




// Download CSV / Excel

function downloadExcel() {


    if (!extractedText) {

        alert("Please read a bill first");

        return;

    }



    const csv =
        "Extracted Bill Details\n\n" +
        extractedText;



    const blob =
        new Blob(

            [csv],

            {
                type:"text/csv"
            }

        );



    const url =
        URL.createObjectURL(blob);



    const a =
        document.createElement("a");


    a.href =
        url;


    a.download =
        "SmartBill_Result.csv";


    a.click();


}
