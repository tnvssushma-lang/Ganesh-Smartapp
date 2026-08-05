let extractedText = "";


// Get elements

const billInput = document.getElementById("billImage");
const preview = document.getElementById("preview");
const readButton = document.getElementById("readButton");
const excelButton = document.getElementById("excelButton");
const statusText = document.getElementById("status");
const billText = document.getElementById("billText");


// Preview uploaded image

billInput.addEventListener("change", function () {

    const file = billInput.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function (e) {

            preview.src = e.target.result;

        };

        reader.readAsDataURL(file);

    }

});


// Read Bill

readButton.addEventListener("click", async function () {

    const file = billInput.files[0];

    if (!file) {

        alert("Please upload a bill image first");
        return;

    }

    try {

        statusText.innerHTML = "Enhancing image...";

        const processedImage = await improveImage(file);

        statusText.innerHTML = "Reading bill...";

        const result = await Tesseract.recognize(
            processedImage,
            "eng",
            {
                tessedit_pageseg_mode: 6,
                logger: function (info) {

                    if (info.status) {

                        statusText.innerHTML =
                            info.status +
                            " " +
                            Math.round(info.progress * 100) +
                            "%";

                    }

                }

            }
        );

        extractedText = cleanText(result.data.text);

        billText.value = extractedText;

        statusText.innerHTML = "Bill reading completed";

    }

    catch (error) {

        console.error(error);

        statusText.innerHTML = "Error: " + error.message;

    }

});


// Improve image for OCR

function improveImage(file) {

    return new Promise(function (resolve) {

        const img = new Image();

        img.onload = function () {

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width * 4;
            canvas.height = img.height * 4;

            ctx.drawImage(
                img,
                0,
                0,
                canvas.width,
                canvas.height
            );

            let imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            let data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {

                let brightness =
                    (data[i] + data[i + 1] + data[i + 2]) / 3;

                if (brightness < 170) {

                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;

                }
                else {

                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;

                }

            }

            ctx.putImageData(
                imageData,
                0,
                0
            );

            resolve(
                canvas.toDataURL("image/png")
            );

        };

        img.src = URL.createObjectURL(file);

    });

}


// Clean OCR output

function cleanText(text) {

    return text
        .replace(/[|{}<>[\]\\]/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();

}


// Download Excel

excelButton.addEventListener("click", function () {

    if (!extractedText) {

        alert("Please read the bill first");
        return;

    }

    const csv = "Bill Details\n\n" + extractedText;

    const blob = new Blob(
        [csv],
        { type: "text/csv" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "SmartBill_Result.csv";

    link.click();

});
