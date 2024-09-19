import pandas as pd
import time
from googletrans import Translator

# Cargar el archivo CSV original
# SELECT TRIM("name") as name, TRIM(REPLACE(REPLACE(description, '\r', ''), '\n', '')) as description, TRIM(address) as address, id as festival_id FROM festivals where publish is true
festivals_df = pd.read_csv('file.csv')

translator = Translator()

def translate_text(text, target_lang, id, tag):
    """Traduce el texto al idioma objetivo, y devuelve el texto original en caso de error."""
    if text is None or pd.isna(text):
        print(f"Skipping translation for festival {id} tag {tag} because the text is None or NaN")
        return text

    try:
        translation = translator.translate(text, dest=target_lang)
        return translation.text
    except Exception as e:
        print(f"Translation error: festival {id} tag {tag}")
        return text

translations = []

for index, row in festivals_df.iterrows():
    try:
        festival_id = row['festival_id'] if 'festival_id' in row and pd.notna(row['festival_id']) else "Unknown"
        name = row['name'] if pd.notna(row['name']) else None
        description = row['description'] if pd.notna(row['description']) else None
        address = row['address'] if pd.notna(row['address']) else "No Address"

        print(f"Processing festival {festival_id}")
        time.sleep(1)

        en_name = translate_text(name, 'en', festival_id, 'name') if name else "No Name"
        es_name = translate_text(name, 'es', festival_id, 'name') if name else "No Name"
        fr_name = translate_text(name, 'fr', festival_id, 'name') if name else "No Name"


        en_desc = translate_text(description, 'en', festival_id, 'desc') if description else "No Description"
        es_desc = translate_text(description, 'es', festival_id, 'desc') if description else "No Description"
        fr_desc = translate_text(description, 'fr', festival_id, 'desc') if description else "No Description"

        translations.append([festival_id, en_name, en_desc, address, 1])  # Inglés
        translations.append([festival_id, es_name, es_desc, address, 2])  # Español
        translations.append([festival_id, fr_name, fr_desc, address, 3])  # Francés

    except Exception as e:
        print(f"Error processing festival {festival_id}: {e}")
        continue

translated_df = pd.DataFrame(translations, columns=['festival_id', 'name', 'description', 'address', 'lang'])

translated_df.to_csv('festival_lang.csv', index=False)

print("Traducción completada y guardada en 'translated_festivals.csv'")