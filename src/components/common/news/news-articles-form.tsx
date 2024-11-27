'use client';

import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { saveNew } from '@/db/queries/news';

const NewsForm: React.FC = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: 'Escribe aquí el contenido...',
      }),
      CharacterCount.configure({
        limit: 1000,
      }),
    ],
    content: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/img/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) throw new Error('Error al subir la imagen');
    const data = await response.json();
    return data.url; // Devuelve la URL pública de la imagen
};

const handleSubmit = useCallback(async () => {
    if (!title || !description || !editor?.getText()) {
        setError('Todos los campos son obligatorios.');
        return;
    }

    if (editor?.storage.characterCount.characters > 1000) {
        setError('El contenido no puede superar los 1000 caracteres.');
        return;
    }

    let imageUrl: string | null = null;

    if (image) {
        try {
            imageUrl = await uploadImage(image);
        } catch (error) {
            setError('Error al subir la imagen.');
            return;
        }
    }

    const newPage = {
        type_new: "news",
        content_new: {
            title,
            description,
            content: editor.getHTML(),
            image: imageUrl,
        },
    };

    try {
        await saveNew(newPage);
        alert('Noticia guardada exitosamente');
        router.push('/news');
    } catch (err) {
        console.error(err);
        setError('Ocurrió un error al guardar la noticia.');
    }
}, [title, description, editor, image, router]);


  return (
    <div className="max-w-3xl mx-auto p-6 border rounded-md shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Crear Noticia</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ingresa el título"
          required
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ingresa la descripción"
          required
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="content">Contenido</Label>
        <div className="border rounded-md p-4">
          <EditorContent editor={editor} />
        </div>
        <small className="block text-gray-500 mt-2">
          {editor?.storage.characterCount.characters || 0}/1000 caracteres
        </small>
      </div>

      <div className="mb-4">
        <Label htmlFor="image">Imagen</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {image && <p className="text-sm text-gray-500 mt-2">Imagen seleccionada: {image.name}</p>}
      </div>

      <Button onClick={handleSubmit} className="w-full bg-blue-500 text-white hover:bg-blue-600">
        Guardar Noticia
      </Button>
    </div>
  );
};

export default NewsForm;
