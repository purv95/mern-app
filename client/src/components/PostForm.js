import React from "react";
import { Form, Button, Segment } from "semantic-ui-react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import { useForm } from "../util/hooks";
import { FETCH_POSTS_QUERY } from "../util/graphql";

function PostForm() {
  const { values, onChange, onSubmit } = useForm(createPostCallBack, {
    body: "",
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
    },
    onError(err) {
      return err;
    },
  });

  function createPostCallBack() {
    createPost();
  }

  function imageUpload() {
    console.log("Image Uploaded");
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
            <input type="file" accept="image/*" onChange={imageUpload} />

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
