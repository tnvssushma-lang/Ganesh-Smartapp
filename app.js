let extractedText = "";


// Get page elements

const billInput = document.getElementById("billImage");
const preview = document.getElementById("preview");
const readButton = document.getElementById("readButton");
const excelButton = document.getElementById("excelButton");

const statusText = document.getElementById("status");
const billText = document.getElementById("billText");



// Show uploaded image preview

billInput.addEventListener("change", function () {


    const file = billInput.files[0];


    if (file) {


        const reader = new FileReader();


        reader.onload = function(e) {

            preview.src = e.target.result;

        };


        reader.readAsDataURL(file);


    }


});




// Read Bill button

readButton.addEventListener("click", async function () {


    const file = billInput.files[0];


    if (!file) {

        alert("Please upload a bill image first");

        return;

    }



    try {


        statusText.innerHTML =
        "Preparing image...";



        const image =
        await improveImage(file);



        statusText.innerHTML =
        "Reading bill...";



        const result =
        await Tesseract.recognize(

            image,

            "eng",

            {

                logger:function(info){


                    if(info.status){


                        statusText.innerHTML =
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
        cleanText(result.data.text);



        billText.value =
        extractedText;



        statusText.innerHTML =
        "Bill reading completed";


    }


    catch(error){


        console.log(error);


        statusText.innerHTML =
        "Error reading bill. Please try again.";


    }



});






// Improve image quality

function improveImage(file){


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

function cleanText(text){


    return text

    .replace(/[|{}<>[\]\\]/g," ")

    .replace(/\n\s*\n/g,"\n")

    .trim();


}






// Download Excel

excelButton.addEventListener("click", function(){


    if(!extractedText){


        alert(
            "Please read the bill first"
        );


        return;


    }



    const csv =
    "Bill Details\n\n" +
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



    const link =
    document.createElement("a");



    link.href =
    url;



    link.download =
    "SmartBill_Excel.csv";



    link.click();



});
