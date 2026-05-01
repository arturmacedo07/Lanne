import cv2
import numpy as np
from PIL import Image

# Load the image
img = cv2.imread('/Users/arturmacedo/.gemini/antigravity/brain/93b63e5f-a9f8-4ce5-a304-e80cec7c3219/media__1777650332402.png', cv2.IMREAD_UNCHANGED)

# Convert to grayscale to find the white lines
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to isolate white lines
# The lines are white, so they will be bright (near 255)
_, mask = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY)

# The outer edge of the image is also white, so we need to mask out the circular region.
# Let's find contours of the white mask.
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Create an empty alpha channel
alpha = np.zeros_like(mask)

# Target color: #4b2c7f (R: 75, G: 44, B: 127) -> BGR: (127, 44, 75)
target_bgr = (127, 44, 75)

# Create an output image with 4 channels (BGRA) initialized to transparent
h, w = img.shape[:2]
out = np.zeros((h, w, 4), dtype=np.uint8)

# Instead of complex contour math, we know the brain is in the center.
# Let's crop to the center roughly, or just find the largest connected component of white lines.
# Actually, the background is white outside the circle.
# Let's find the circle.
# Invert the gray image to find the purple circle
_, circle_mask = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

# The circle mask will be white where it's dark purple.
# We can use this circle mask to mask out the outer white background.
# Apply the circle mask to the white lines mask
brain_mask = cv2.bitwise_and(mask, circle_mask)

# Now brain_mask contains mostly the white lines inside the purple circle.
# There might be some white text "LIGA ACADEMICA..." in the purple ring.
# We need to filter out the text. The text is near the edge.
# The brain is in the center.
# Find contours of brain_mask
contours, _ = cv2.findContours(brain_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Find the bounding box of the brain by taking contours near the center
center_x, center_y = w // 2, h // 2
brain_contours = []
for cnt in contours:
    x, y, w_box, h_box = cv2.boundingRect(cnt)
    # Filter out text which is small and near the edges
    if w_box * h_box > 50: # ignore very small dots
        # Check if it's not too far from center
        if abs((x + w_box/2) - center_x) < w * 0.4 and abs((y + h_box/2) - center_y) < h * 0.4:
            brain_contours.append(cnt)

# Draw the filtered brain contours onto the output image
final_mask = np.zeros_like(mask)
cv2.drawContours(final_mask, brain_contours, -1, 255, thickness=cv2.FILLED)

# Since we want the lines, we just use the original mask where final_mask is drawn
# Actually, let's just use the bounding box of the brain to crop the original image,
# and then threshold out the white lines, making them purple, and the rest transparent.

# Let's find the exact bounding box of the brain.
x_min, y_min, x_max, y_max = w, h, 0, 0
for cnt in brain_contours:
    x, y, w_box, h_box = cv2.boundingRect(cnt)
    x_min = min(x_min, x)
    y_min = min(y_min, y)
    x_max = max(x_max, x + w_box)
    y_max = max(y_max, y + h_box)

# Add some padding
pad = 10
x_min = max(0, x_min - pad)
y_min = max(0, y_min - pad)
x_max = min(w, x_max + pad)
y_max = min(h, y_max + pad)

# Apply color and transparency
for y in range(y_min, y_max):
    for x in range(x_min, x_max):
        if brain_mask[y, x] > 0:
            # It's a white line, make it purple and opaque
            out[y, x] = [127, 44, 75, 255]

# Crop the image to the bounding box
out_cropped = out[y_min:y_max, x_min:x_max]

cv2.imwrite('/Users/arturmacedo/Library/Mobile Documents/com~apple~CloudDocs/Aplicativos/Lanne/public/logo_final.png', out_cropped)
print("Saved logo_final.png")

