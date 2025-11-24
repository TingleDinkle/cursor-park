// 1. Create the Parking HTML Elements
const parkingLot = document.createElement('div');
parkingLot.id = 'cursor-parking-lot';
parkingLot.title = "Click to Park Cursor (ESC to leave)";

const icon = document.createElement('div');
icon.className = 'parking-icon';
icon.innerText = 'P';

const text = document.createElement('div');
text.className = 'parking-text';
text.innerText = 'Click to Park';

// A fake cursor to show when the real one is locked (hidden)
const virtualCursor = document.createElement('div');
virtualCursor.id = 'virtual-cursor';

parkingLot.appendChild(icon);
parkingLot.appendChild(text);
parkingLot.appendChild(virtualCursor);
document.body.appendChild(parkingLot);

// 2. State Variables
let isParked = false;

// 3. Dragging Functionality (Move the parking spot around)
let isDragging = false;
let startX, startY, startLeft, startTop;

parkingLot.addEventListener('mousedown', (e) => {
    // If we are already parked, ignore dragging
    if (isParked) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    // Get current position
    const rect = parkingLot.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    
    // Remove 'right' and 'bottom' constraints to allow free movement
    parkingLot.style.right = 'auto';
    parkingLot.style.bottom = 'auto';
    parkingLot.style.left = startLeft + 'px';
    parkingLot.style.top = startTop + 'px';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        parkingLot.style.left = (startLeft + dx) + 'px';
        parkingLot.style.top = (startTop + dy) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// 4. Parking Logic (The "Tech Stack" Magic)

// When clicking the spot, request Pointer Lock
parkingLot.addEventListener('click', async () => {
    if (isDragging) return; // Don't park if we just finished dragging

    try {
        if (!isParked) {
            // This is the API that "parks" the mouse
            await parkingLot.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    } catch (err) {
        console.error("Parking failed:", err);
    }
});

// Listen for the lock state change (Browser confirms lock)
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === parkingLot) {
        // MOUSE IS PARKED
        isParked = true;
        parkingLot.classList.add('parked');
        text.innerText = "PARKED\n(ESC to exit)";
        
        // Show our fake cursor centered in the spot
        virtualCursor.style.display = 'block';
        virtualCursor.style.top = '50%';
        virtualCursor.style.left = '50%';
        virtualCursor.style.transform = 'translate(-50%, -50%)';
    } else {
        // MOUSE IS FREE
        isParked = false;
        parkingLot.classList.remove('parked');
        text.innerText = "Click to Park";
        virtualCursor.style.display = 'none';
    }
});