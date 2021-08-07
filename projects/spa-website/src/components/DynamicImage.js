
import React from 'react';

const DynamicImage = (props) => {
  const altText = props.alt || "dynamic image";
  return (
    <img src={"https://s3.amazonaws.com/aws-mobile-hub-images/wild-rydes/" + props.src} alt={altText}/>
  );
};

export default DynamicImage;
