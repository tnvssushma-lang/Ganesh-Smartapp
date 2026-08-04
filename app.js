let extractedText = "";


// Image preprocessing to improve OCR accuracy
function preprocessImage(file) {

    return new Promise((resolve) => {

        let img = new Image();

        img.onload = function () {

            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;


            ctx.drawImage(img, 0, 0);


            let imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );


            let data = imageData.data;


            // Convert to black and white + increase contrast
            for (let i = 0; i < data.length; i += 4) {


                let brightness =
                (data[i] + data[i + 1] + data[i + 2]) / 3;


                brightness = brightness < 150 ? 0 : 255;


                data[i] = brightness;
                data[i + 1] = brightness;
                data[i + 2] = brightness;


            }


            ctx.putImageData(imageData, 0, 0);



            canvas.toBlob(function(blob) {

                resolve(blob);

            }, "image/png");


        };


        img.src = URL.createObjectURL(file);


    });

}





function processBill() {


    let file = document.getElementById("billImage").files[0];


    if (!file) {

        alert("Please select a bill image first.");

        return;

    }



    document.getElementById("status").innerHTML =
        "Preparing image...";



    preprocessImage(file).then(cleanImage => {



        document.getElementById("status").innerHTML =
        "Reading bill... Please wait";



        Tesseract.recognize(

            cleanImage,

            'eng',

            {

                logger: function(info) {


                    if (info.status === "recognizing text") {


                        let progress =
                        Math.round(info.progress * 100);



                        document.getElementById("status").innerHTML =
                        "Reading bill... " + progress + "%";


                    }


                },


                // Better for bills with columns
                tessedit_pageseg_mode: 4,


                preserve_interword_spaces: true


            }


        )

        .then(({ data: { text } }) => {



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
