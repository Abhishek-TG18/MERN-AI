import React, { useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaMicrophone, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #0e0c16;
  color: white;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #6e8efb, #a777e3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PromptInput = styled.textarea`
  width: 80%;
  max-width: 600px;
  height: 100px;
  margin: 1rem 0;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #1c1a2b;
  color: white;
  resize: none;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  margin: 1rem;
  font-size: 1rem;
  background-color: #6e8efb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;

  &:hover {
    background-color: #a777e3;
    transform: translateY(-3px);
  }
`;

const ImageContainer = styled.div`
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GeneratedImage = styled.img`
  max-width: 80%;
  max-height: 400px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  animation: ${() =>
    keyframes`
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    `} 0.5s ease-out;
`;

const GenearateImage = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    try {
      if (!prompt.trim()) {
        alert('Please enter a prompt.');
        return;
      }
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/genrateimage', { prompt });
      setImage(response.data.resultImage);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = 'generated_image.png';
      link.click();
    }
  };

  return (
    <Container>
      <Title>Magic with Prompts</Title>
      <PromptInput
        placeholder="Enter your image description or speak your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div>
        <Button onClick={handleGenerateImage} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Image'}
        </Button>
        <Button onClick={() => alert('Voice input not implemented yet!')}>
          <FaMicrophone /> Voice Prompt
        </Button>
      </div>
      {image && (
        <ImageContainer>
          <GeneratedImage src={image} alt="Generated Visual" />
          <Button onClick={handleDownload}>
            <FaDownload /> Download
          </Button>
        </ImageContainer>
      )}
      <Link to='https://8b43142d34bf0f7dce.gradio.live/'> 
      <Button>Remove Background with AI</Button>
      </Link>
    </Container>
  );
};

export default GenearateImage;
