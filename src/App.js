import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

const apiAddress =
  "http://fetch-message-in-the-bottle.herokuapp.com/api/v2/messages";

class Messages extends React.Component {
  state = {
    messages: [],
    newMessageBody: "",
    newMessageAuthor: "",
    action: "Post",
    currentMsg: null
  };

  componentDidMount() {
    fetch(apiAddress)
      .then(r => r.json())
      .then(messages => {
        this.setState({ messages });
      });
  }

  handleInputsUpdates = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleMsgEdit = msgId => {
    const msgToEdit = this.state.messages.find(m => m.id === msgId);
    this.setState({
      newMessageBody: msgToEdit.message,
      newMessageAuthor: msgToEdit.real_name,
      action: "Edit",
      currentMsg: msgToEdit.id
    });
    console.log(msgToEdit);
  };

  handlePostAndEdit = (verb, path) => {
    const message = this.state.newMessageBody;
    const real_name = this.state.newMessageAuthor;
    //const { newMessageBody: message, newMessageAuthor: real_name } = this.state;
    const body = { message: { message, real_name } };
    const config = {
      method: verb,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    };
    fetch(path, config)
      .then(r => r.json())
      .then(msgObj => {
        let messages;
        if (this.state.action === "Post") {
          messages = [msgObj, ...this.state.messages];
        }
        if (this.state.action === "Edit") {
          messages = [
            msgObj,
            ...this.state.messages.filter(m => m.id !== this.state.currentMsg)
          ];
        }
        // we will have a variable messages with the updated state
        this.setState({
          messages,
          newMessageBody: "",
          newMessageAuthor: "",
          currentMsg: null
        });
      });
  };

  handleTweetPost = () => {
    if (this.state.action === "Post") {
      this.handlePostAndEdit("POST", apiAddress);
    }
    if (this.state.action === "Edit") {
      this.handlePostAndEdit("PATCH", `${apiAddress}/${this.state.currentMsg}`);
    }
  };

  handleDelete = (msgId, event) => {
    event.stopPropagation();
    // this.setState({
    //   messages: this.state.messages.filter(m => m.id !== msgId)
    // });
    fetch(`${apiAddress}/${msgId}`, { method: "DELETE" })
      .then(r => r.json())
      .then(
        c => {
          this.setState({
            messages: this.state.messages.filter(m => m.id !== msgId)
          });
        },
        () => {
          alert("something went wrong");
        }
      );
  };

  render() {
    return (
      <>
        Message:
        <input
          name="newMessageBody"
          type="text"
          onChange={this.handleInputsUpdates}
          value={this.state.newMessageBody}
        />
        <br />
        Author:{" "}
        <input
          name="newMessageAuthor"
          type="text"
          onChange={this.handleInputsUpdates}
          value={this.state.newMessageAuthor}
        />
        <br />
        <button onClick={this.handleTweetPost}>{this.state.action}</button>{" "}
        <br />
        {this.state.messages.map(mObj => (
          <p onClick={() => this.handleMsgEdit(mObj.id)} key={mObj.id}>
            {mObj.message}{" "}
            <button onClick={event => this.handleDelete(mObj.id, event)}>
              delete
            </button>
          </p>
        ))}
      </>
    );
  }
}

export default Messages;
