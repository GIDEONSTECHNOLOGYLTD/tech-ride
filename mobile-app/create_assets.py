from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('assets', exist_ok=True)

# Icon
icon = Image.new('RGB', (1024, 1024), '#3B82F6')
draw = ImageDraw.Draw(icon)
try:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 400)
except:
    font = ImageFont.load_default()
draw.text((512, 512), 'T', fill='white', font=font, anchor='mm')
icon.save('assets/icon.png')

# Splash
splash = Image.new('RGB', (1242, 2436), '#3B82F6')
draw = ImageDraw.Draw(splash)
draw.text((621, 1218), 'TechRide', fill='white', font=font, anchor='mm')
splash.save('assets/splash.png')

# Adaptive icon
icon.save('assets/adaptive-icon.png')

# Favicon
favicon = icon.resize((48, 48))
favicon.save('assets/favicon.png')

print("Assets created successfully!")
