let extractedText = "";
let billRows = [];


// Clean OCR output
function cleanBillText(text) {

    return text
        .replace(/[|\\§{}[\]<>]/g, " ")
        .replace(/[^\x20-\x7E\n]/g, "")
        .replace(/[ ]{2,}/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();

}



// Extract bill items
function extractBillData(text) {

    let lines = text.split("\n");

    let rows = [];


    lines.forEach(line => {


        line = line.trim();


        // Find lines containing prices
        let numbers = line.match(/\d+\.\d{2}/g);


        if (numbers && numbers.length >= 2) {


            let amount = numbers[numbers.length - 1];

            let price = numbers[numbers.length - 2];


            let qty = "1";


            let itemName = line
                .replace(/\d+\.\d{2}/g, "")
                .replace(/\d+/g, "")
                .trim();



            if (
                itemName.length > 3 &&
                !itemName.toLowerCase().includes("total") &&
                !itemName.toLowerCase().includes("tax") &&
                !itemName.toLowerCase().includes("gst")
            ) {


                rows.push([

                    itemName,

                    qty,

                    price,

                    amount

                ]);

            }


        }


    });


    return rows;

}






// Image preprocessing
function preprocessImage(file) {


    return new Promise((resolve)=>{


        let img = new Image();


        img.onload=function(){


            let canvas=document.createElement("canvas");

            let ctx=canvas.getContext("2d");


            canvas.width=img.width;

            canvas.height=img.height;


            ctx.drawImage(img,0,0);



            let imageData=ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );


            let data=imageData.data;


            for(let i=0;i<data.length;i+=4){


                let brightness =
                (data[i]+data[i+1]+data[i+2])/3;


                brightness = brightness < 150 ? 0 : 255;


                data[i]=brightness;

                data[i+1]=brightness;

                data[i+2]=brightness;


            }


            ctx.putImageData(imageData,0,0);



            canvas.toBlob(blob=>{

                resolve(blob);

            },"image/png");


        };


        img.src=URL.createObjectURL(file);


    });


}








function processBill(){


let file=document.getElementById("billImage").files[0];


if(!file){

alert("Please select a bill image first.");

return;

}



document.getElementById("status").innerHTML =
"Preparing image...";



preprocessImage(file).then(cleanImage=>{


Tesseract.recognize(

cleanImage,

'eng',

{


logger:function(info){


if(info.status==="recognizing text"){


let progress=Math.round(info.progress*100);


document.getElementById("status").innerHTML =
"Reading bill... "+progress+"%";


}


},


tessedit_pageseg_mode:4,

preserve_interword_spaces:true


}


)

.then(({data:{text}})=>{


extractedText=cleanBillText(text);



billRows=extractBillData(extractedText);



document.getElementById("billText").value =
extractedText;



document.getElementById("status").innerHTML =
"Bill reading completed";


})

.catch(error=>{


console.log(error);


document.getElementById("status").innerHTML =
"Unable to read bill";


});


});


}









function exportExcel(){



if(billRows.length===0){


alert("Please convert a bill first.");


return;


}




let data=[


["Item","Qty","Price","Amount"],


...billRows


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
