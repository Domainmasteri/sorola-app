#!/bin/bash

OLD_NAME="fi.sorola.app"
NEW_NAME="fi.sorola.toolbox"

echo "Aloitetaan korvaus: $OLD_NAME -> $NEW_NAME"

find . -type f \
  \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.xml" -o -name "*.gradle" -o -name "*.kt" -o -name "*.java" -o -name "*.properties" -o -name "*.txt" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/android/build/*" \
  -not -path "*/ios/build/*" \
  -not -path "*/.gradle/*" | while read -r file; do
    if grep -q "$OLD_NAME" "$file"; then
        sed -i "s/$OLD_NAME/$NEW_NAME/g" "$file"
        echo "Päivitetty: $file"
    fi
done

echo "Kaikki valmista! Muista ajaa vielä puhdistus."
