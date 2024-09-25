'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [allImage, setAllImage] = useState([]);
  const [image, setImage] = useState(null);

  // Function to fetch images from the API and update state
  const FetchImage = async () => {
    try {
      const response = await axios.get('/api/uploads');
      const data = await response.data;

      // Update state with the image paths received from the database
      setAllImage(data?.files || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  // Function to delete an image
  const DeleteImage = async (name) => {
    try {
      const response = await axios.delete('/api/uploads', {
        params: {
          image: name,
        },
      });
      const data = await response.data;
      console.log({ data });
      FetchImage(); // Update the image list after deletion
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Function to handle image upload
  const OnSubmitHandler = async (e) => {
    e.preventDefault();

    if (!image) {
      alert('Please upload an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    // Log the image being uploaded
    console.log('Uploading image:', image);
    console.log('FormData contents:', formData.get('image'));

    try {
      const response = await axios.post('/api/uploads', formData);
      const data = await response.data;
      console.log('Upload response:', data);
      FetchImage(); // Update the image list after upload
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Fetch the image list when the page first loads
  useEffect(() => {
    FetchImage();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 gap-5">
      <form onSubmit={OnSubmitHandler} className="w-1/2 mx-auto flex flex-col gap-5">
        <input onChange={(e) => setImage(e.target.files[0])} type="file" />
        <div className="flex justify-center items-center">
          <button type="submit" className="px-12 py-3 rounded text-white bg-blue-500">
            Upload
          </button>
        </div>
      </form>

      <div className="w-full flex flex-wrap">
        {allImage && allImage.length > 0 && allImage.map((cur, i) => {
          return (
            <div key={i} className="w-1/3 mx-auto p-4 border border-purple-500 ring-2">
              <img src={cur.path} alt={`image${i}`} />
              <button
                onClick={() => DeleteImage(cur.path.split('/').pop())}
                className="px-5 py-2 text-white rounded mr-auto my-2 bg-red-500"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
