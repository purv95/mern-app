import React, { useContext } from "react";
import { Form, Button, Segment, Icon } from "semantic-ui-react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import Resizer from "react-image-file-resizer";
import axios from "axios";
import { AuthContext } from "../context/auth";

import { useForm } from "../util/hooks";
import { FETCH_POSTS_QUERY } from "../util/graphql";

function PostForm() {
  const { user } = useContext(AuthContext);
  const { values, onChange, onSubmit } = useForm(createPostCallBack, {
    body: "",
    image: "",
  });
  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    update(proxy, result) {
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY,
      });
      data.getPosts = [result.data.createPost, ...data.getPosts];
      proxy.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: {
          getPosts: [result.data.createPost, ...data.getPosts],
        },
      });
      values.body = "";
      values.image = "";
    },
    onError(err) {
      return err;
    },
  });

  function createPostCallBack() {
    createPost();
  }

  function ImageUpload(e) {
    let fileInput = false;
    if (e.target.files[0]) {
      fileInput = true;
    }
    if (fileInput) {
      Resizer.imageFileResizer(
        e.target.files[0],
        500,
        500,
        "JPEG",
        100,
        0,
        (uri) => {
          // console.log(uri);
          axios
            .post(
              `http://localhost:5000/uploadimages`,
              { image: uri },
              {
                headers: {
                  user,
                },
              }
            )
            .then((res) => {
              console.log("Cloudinary upload", res);
              createPostCallBack({ ...values, image: [res.data] });
            })
            .catch((error) => {
              console.log("Cloudinary Upload Failed", error);
            });
        },
        "base64"
      );
    }
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <h2>Create a Post</h2>
        <Segment vertical>
          <Form.Field>
            <Form.Input
              placeholder="What's on your mind?"
              name="body"
              onChange={onChange}
              value={values.body}
              error={error ? true : false}
            />
            <label>
              <Icon name="folder open outline" size="large"></Icon>
              <input
                hidden
                type="file"
                accept="image/*"
                value={values.image}
                onChange={ImageUpload}
              />
            </label>
            <Button
              type="submit"
              size="large"
              color="red"
              floated="left"
              style={{ margin: 10 }}
              className="submit__button"
            >
              Submit
            </Button>
          </Form.Field>
        </Segment>
      </Form>
      {error && (
        <div
          className="ui error message"
          id="post__empty"
          style={{ marginBottom: 20 }}
        >
          <ul className="list">
            <li>{error.graphQLErrors[0].message}</li>
          </ul>
        </div>
      )}
    </>
  );
}

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      username
      image {
        url
        public_id
      }
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments {
        id
        body
        createdAt
        username
      }
      commentCount
    }
  }
`;

export default PostForm;
