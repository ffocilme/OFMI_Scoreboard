import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import basename from "../utils/basename.jsx";
export default function FeaturedCard(props) {
  return (
    <a
      href={`${basename}/contest/${props.id}`}
      style={{ textDecoration: "none" }}
    >
      <Card sx={{ maxWidth: 300, boxShadow: 3 }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="200"
            image={props.img}
            alt={props.alt}
          />
          <CardContent>
            <Typography variant="h5" component="div">
              {props.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Organizador: {props.organizer}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {props.content}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </a>
  );
}
