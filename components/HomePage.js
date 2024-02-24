import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Grid,
  TextField,
  Button,
  styled,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import Alert from "@mui/material/Alert";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import io from "socket.io-client";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

const StyledInput = styled("input")({
  display: "none",
});

const HomePage = () => {
  const [photo, setPhoto] = useState([]);
  const [description, setDescription] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [likedIndexes, setLikedIndexes] = useState([]);

  useEffect(() => {
    console.log("Effect triggered");
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket connected successfully!");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected!");
    });

    socket.on("error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("updatePhotos", (photoData) => {
      console.log("Received updated photo data:", photoData);
      setPhoto(photoData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setSelectedPhoto(file);
  };

  const handleLike = (index) => {
    if (!likedIndexes.includes(index)) {
      const updatedPhotos = photo.map((item, i) => {
        if (i === index) {
          return { ...item, likes: item.likes + 1 };
        }
        return item;
      });
      setPhoto(updatedPhotos);
      socket.emit("like", { index, photo: updatedPhotos[index] });
      setLikedIndexes([...likedIndexes, index]);
    }
  };

  const handleComment = (index) => {
    if (commentText.trim() !== "") {
      const updatedPhotos = photo.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            comments: [...(item.comments || []), commentText],
          };
        }
        return item;
      });
      setPhoto(updatedPhotos);
      socket.emit("comment", { index, photo: updatedPhotos[index] });
      setCommentText("");
    }
  };

  const handleSubmit = () => {
    if (selectedPhoto && selectedPhoto.size <= 5 * 1024 * 1024) {
      const url = URL.createObjectURL(selectedPhoto);
      const newPhoto = { url, description, likes: 0, comments: [] };
      const updatedPhotos = [...photo, newPhoto];
      setPhoto(updatedPhotos);
      socket.emit("likeOrComment", updatedPhotos);
      setDescription("");
      setSelectedPhoto(null);
      setShowCards(true);
    } else {
      setShowAlert(true);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={16} md={4}>
        <Container maxWidth="sm" component="main">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            backgroundColor="whitesmoke"
            padding="18px"
            borderRadius="18px"
            boxShadow="0px 4px 6px rgba(0,0,0,0.1)"
          >
            <Typography variant="h5" component="h1" m={2} color="primary">
              Post your memory
            </Typography>
            <label htmlFor="upload-photo">
              <StyledInput
                id="upload-photo"
                type="file"
                onChange={handlePhotoChange}
              />
              <Box
                width="220px"
                height="220px"
                border="2px dashed grey"
                borderRadius="10px"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {selectedPhoto ? (
                  <img
                    src={URL.createObjectURL(selectedPhoto)}
                    alt="selected"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                ) : (
                  <AddPhotoAlternateIcon color="primary" cursor="pointer" />
                )}
              </Box>
            </label>
            <TextField
              label="Description (Optional)"
              variant="outlined"
              margin="normal"
              value={description}
              onChange={handleDescriptionChange}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="small"
              sx={{ textTransform: "capitalize" }}
            >
              Upload
            </Button>
            {showAlert && (
              <Alert
                severity="error"
                onClose={() => setShowAlert(false)}
                sx={{ marginTop: "2rem" }}
              >
                Please select a photo with size less than or equal to 5 MB.
              </Alert>
            )}
          </Box>
        </Container>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box display="flex" flexDirection="column" gap={4}>
          {showCards &&
            photo.map((photo, index) => (
              <Card key={index}>
                <CardContent>
                  <Box
                    width="100%"
                    height="300px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    border="2px grey"
                    borderRadius="10px"
                  >
                    <img
                      src={photo.url}
                      alt="uploaded"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  </Box>
                  <Box textAlign="start" mt={2}>
                    {photo.description && <div>{photo.description}</div>}
                    <CardActions>
                      <IconButton
                        aria-label="add to favorites"
                        onClick={() => handleLike(index)}
                      >
                        <FavoriteIcon />
                        {photo.likes}
                      </IconButton>
                      <IconButton
                        aria-label="comment"
                        onClick={() =>
                          setShowCommentBox((prevIndex) =>
                            prevIndex === index ? null : index
                          )
                        }
                      >
                        <ChatIcon />
                        {photo.comments.length}
                      </IconButton>
                    </CardActions>
                    {showCommentBox === index && (
                      <Box mt={2} display="flex" alignItems="center">
                        <TextField
                          label="Add a comment"
                          variant="outlined"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          size="small"
                          fullWidth
                        />
                        <IconButton
                          aria-label="sent"
                          onClick={() => handleComment(index)}
                        >
                          <SendOutlinedIcon />
                        </IconButton>
                      </Box>
                    )}
                    {showCommentBox === index && (
                      <Box mt={2}>
                        {photo.comments && (
                          <Box>
                            {Array.isArray(photo.comments) ? (
                              photo.comments.map((comment, commentIndex) => (
                                <Box
                                  key={commentIndex}
                                  mt={1}
                                  border={1}
                                  borderColor="grey.300"
                                  p={1}
                                  borderRadius={4}
                                >
                                  <Typography>{comment}</Typography>
                                </Box>
                              ))
                            ) : (
                              <Box
                                mt={1}
                                border={1}
                                borderColor="grey.300"
                                p={1}
                                borderRadius={4}
                              >
                                <Typography>{photo.comments}</Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default HomePage;
