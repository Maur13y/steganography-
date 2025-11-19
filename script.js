
// script.js
// Matrix background effect
const matrixBg = document.getElementById('matrixBg');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
matrixBg.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = "01010101010101010101010101010101";
const charArray = chars.split("");
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for(let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";
    
    for(let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

// Tab functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// File input labels
document.getElementById('encodeimage1').addEventListener('change', function() {
    document.getElementById('encodeImageLabel').textContent = this.files[0] ? this.files[0].name : 'Choose an image file';
});

document.getElementById('decodeimage1').addEventListener('change', function() {
    document.getElementById('decodeImage1Label').textContent = this.files[0] ? this.files[0].name : 'Choose the original image';
});

document.getElementById('decodeimage2').addEventListener('change', function() {
    document.getElementById('decodeImage2Label').textContent = this.files[0] ? this.files[0].name : 'Choose the encoded image';
});

// Steganography functionality
let encodebtn = document.getElementById("encodebtn")
let encodeimage1fileinput = document.getElementById("encodeimage1")
let canvasbox = document.getElementById("canvasbox")
let secretTextField = document.getElementById("secretText");
let loadedImage;
let encodedImage;
let decodebtn = document.getElementById("decodebtn")
let decodeimage1fileinput = document.getElementById("decodeimage1")
let decodeimage2fileinput = document.getElementById("decodeimage2")
let decodeimage1;
let decodeimage2;
let encodeStatus = document.getElementById("encodeStatus");
let decodeStatus = document.getElementById("decodeStatus");
let decodedText = document.getElementById("decodedText");

encodebtn.addEventListener("click", e => {
    console.log("encoding...")
    encodebtn.classList.add("disabled")
    encodebtn.disabled = true;
    encodeStatus.textContent = "Encoding message...";
    encodeStatus.className = "status";
    
    // Check if a file is selected
    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        // Check if message is provided
        if (!secretTextField.value.trim()) {
            encodeStatus.textContent = "Error: Please enter a secret message";
            encodeStatus.className = "status error";
            encodebtn.classList.remove("disabled")
            encodebtn.disabled = false;
            return;
        }
        
        // Use p5.js loadImage function to load the image
        loadedImage = loadImage(URL.createObjectURL(encodeimage1fileinput.files[0]), () => {
            loadedImage.loadPixels();
            console.log("Pixel data:", loadedImage.pixels);

            // Get the text to hide
            let secretText = secretTextField.value;
            console.log("secret message:", secretText)

            // Encode the message in the image
            encodedImage = createImage(loadedImage.width, loadedImage.height);
            encodedImage.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, loadedImage.width, loadedImage.height);

            encodedImage.loadPixels()
            console.log("Pixel data:", encodedImage.pixels);

            // Encode the message in the image
            encodeMessage(encodedImage, secretText);

            // Display the modified image
            let canvas = createCanvas(encodedImage.width, encodedImage.height);
            canvas.parent('canvasbox');
            image(encodedImage, 0, 0);

            // force download the encodedimage
            downloadEncodedImage(encodedImage, 'encoded_image.png');
            
            encodeStatus.textContent = "Message encoded successfully! Image downloaded.";
            encodeStatus.className = "status success";
            
            // Re-enable button after a delay
            setTimeout(() => {
                encodebtn.classList.remove("disabled")
                encodebtn.disabled = false;
            }, 2000);

        }, err => {
            console.error("Error loading image:", err);
            encodeStatus.textContent = "Error loading image";
            encodeStatus.className = "status error";
            encodebtn.classList.remove("disabled")
            encodebtn.disabled = false;
        });
    } else {
        encodeStatus.textContent = "Error: Please select an image file";
        encodeStatus.className = "status error";
        encodebtn.classList.remove("disabled")
        encodebtn.disabled = false;
    }
})

decodebtn.addEventListener("click", e => {
    console.log("decoding...")
    decodebtn.classList.add("disabled")
    decodebtn.disabled = true;
    decodeStatus.textContent = "Decoding message...";
    decodeStatus.className = "status";

    //load images - first one is original and second one with message. compare them and find the message inside
    // Check if both files are selected
    if (decodeimage1fileinput.files && decodeimage1fileinput.files[0] && decodeimage2fileinput.files && decodeimage2fileinput.files[0]) {
        // Load the two images
        loadImage(URL.createObjectURL(decodeimage1fileinput.files[0]), img1 => {
            loadImage(URL.createObjectURL(decodeimage2fileinput.files[0]), img2 => {
                img1.loadPixels()
                img2.loadPixels()
                console.log("image 1:", img1)
                console.log("image 2:", img2)

                // Decode the hidden message
                let decodedMessage = decodeMessage(img1, img2);
                console.log("Decoded Message:", decodedMessage);

                // Display the decoded message
                decodedText.value = decodedMessage;
                
                if (decodedMessage.trim()) {
                    decodeStatus.textContent = "Message decoded successfully!";
                    decodeStatus.className = "status success";
                } else {
                    decodeStatus.textContent = "No message found or error in decoding";
                    decodeStatus.className = "status error";
                }

                // Re-enable button
                decodebtn.classList.remove("disabled")
                decodebtn.disabled = false;

            }, err => {
                console.error("Error loading encoded image:", err);
                decodeStatus.textContent = "Error loading encoded image";
                decodeStatus.className = "status error";
                decodebtn.classList.remove("disabled")
                decodebtn.disabled = false;
            });
        }, err => {
            console.error("Error loading original image:", err);
            decodeStatus.textContent = "Error loading original image";
            decodeStatus.className = "status error";
            decodebtn.classList.remove("disabled")
            decodebtn.disabled = false;
        });
    } else {
        decodeStatus.textContent = "Error: Please select both image files";
        decodeStatus.className = "status error";
        decodebtn.classList.remove("disabled")
        decodebtn.disabled = false;
    }
})

// Define the p5.js sketch
function setup() {
    // No need to create canvas here as we'll create it dynamically
}

function draw() {
    noLoop()
}

// Function to encode the message by modifying color channels
function encodeMessage(img, message) {
    let binaryMessage = textToBinary(message);
    img.loadPixels();

    let index = 0;
    for (let i = 0; i < img.pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            if (index < binaryMessage.length) {
                // Get the binary value from the message
                let bit = int(binaryMessage[index]);

                // Only increment the color channel value if the bit is 1 and the current value is not at the maximum (255)
                if (bit === 1 && img.pixels[i + j] < 255) {
                    img.pixels[i + j]++;
                } else if (bit === 1 && img.pixels[i + j] == 255) {
                    img.pixels[i + j]--;
                }

                index++;
            }
        }
    }

    img.updatePixels();
}

function textToBinary(text) {
    let binaryMessage = '';
    for (let i = 0; i < text.length; i++) {
        let binaryChar = text[i].charCodeAt(0).toString(2);
        binaryMessage += '0'.repeat(8 - binaryChar.length) + binaryChar;
    }
    return binaryMessage;
}

function downloadEncodedImage(img, filename) {
    // Create a temporary link
    let link = document.createElement('a');
    // Convert the canvas to data URL
    let dataURL = img.canvas.toDataURL();
    // Set the href attribute of the link to the data URL
    link.href = dataURL;
    // Set the download attribute with the desired filename
    link.download = filename;
    // Append the link to the document
    document.body.appendChild(link);
    // Programmatically trigger a click on the link
    link.click();
    // Remove the link from the document
    document.body.removeChild(link);
}

// Function to decode the hidden message
function decodeMessage(originalImage, encodedImage) {
    let decodedMessage = "";
    originalImage.loadPixels();
    encodedImage.loadPixels();

    for (let i = 0; i < originalImage.pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            // Compare color channel values and append to the decoded message
            let originalValue = int(originalImage.pixels[i + j]);
            let encodedValue = int(encodedImage.pixels[i + j]);

            // If color channel values are different, append '1', otherwise, append '0'
            if (originalValue !== encodedValue) {
                decodedMessage += '1';
            } else {
                decodedMessage += '0';
            }
        }
    }

    // Convert the binary message to text
    let textMessage = binaryToText(decodedMessage);
    return textMessage;
}

// Function to convert binary to text
function binaryToText(binaryMessage) {
    let textMessage = "";
    for (let i = 0; i < binaryMessage.length; i += 8) {
        let byte = binaryMessage.substr(i, 8);
        textMessage += String.fromCharCode(parseInt(byte, 2));
    }
    return textMessage;
}