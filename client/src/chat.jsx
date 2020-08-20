import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql, useSubscription } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Container, Row, Col, FormInput, Button } from "shards-react";

const SERVER_PORT = 4000;
const SERVER_URL = `http://localhost:${SERVER_PORT}/`;
const SOCKET_URL = `ws://localhost:${SERVER_PORT}/`;

const wsLink = new WebSocketLink({
    uri: SOCKET_URL,
    options: {
        reconnect: true
    }
});

const client = new ApolloClient({
    uri: SERVER_URL,
    link: wsLink,
    cache: new InMemoryCache(),
});

// const GET_MESSAGES = gql`
// query {
//     messages {
//         id
//         content
//         user
//     }
// }`;

const GET_MESSAGES = gql`
subscription {
    messages {
        id
        content
        user
    }
}`;

const POST_MESSAGE = gql`
mutation ($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
}`;

const Messages = ({ user }) => {
    // const { data } = useQuery(GET_MESSAGES);
    const { data } = useSubscription(GET_MESSAGES);
    if (!data) return null;
    return (
        <>
            {data.messages.map(({ id, user: messageUser, content }) => (
                <div
                    key={id}
                    style={{
                        display: "flex",
                        justifyContent: user === messageUser ? "flex-end" : "flex-start",
                        paddingBottom: "1em"
                    }}>
                    {user !== messageUser && (
                        <div
                            style={{
                                height: 50,
                                width: 50,
                                marginRight: "0.5em",
                                border: "2px solid #e5e6ea",
                                borderRadius: 25,
                                textAlign: "center",
                                fontSize: "18pt",
                                padding: 5
                            }}>
                            {messageUser.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div
                        style={{
                            background: user === messageUser ? "#58bf56" : "#e5e6ea",
                            color: user === messageUser ? "white" : "black",
                            padding: "1em",
                            borderRadius: "1em",
                            maxWidth: "60%"
                        }}>
                        {content}
                    </div>
                </div>
            ))}
        </>
    );
}

const ChatInput = ({ colSize, label, state, stateSet, onSend }) => {
    const valueToModify = label.toLowerCase();
    return (
        <Col xs={colSize}>
            <FormInput
                label={label}
                value={state[valueToModify]}
                onChange={(evt) => stateSet({ ...state, [valueToModify]: evt.target.value })}
                onKeyUp={(evt) => evt.keyCode === 13 && valueToModify === "content" ? onSend() : null}
            />
        </Col>
    );
};

const Chat = () => {
    const [state, stateSet] = React.useState({ user: "John", content: "" });
    const [postMessage] = useMutation(POST_MESSAGE);

    const onSend = () => {
        if (state.content.length > 0) postMessage({ variables: state })
        stateSet({ ...state, content: "" })
    };

    return (
        <Container>
            <Messages user={state.user} />
            <Row>
                <ChatInput colSize={2} label={"User"} state={state} stateSet={stateSet} />
                <ChatInput colSize={8} label={"Content"} state={state} stateSet={stateSet} onSend={onSend} />
                <Col xs={2} style={{ padding: 0 }}>
                    <Button onClick={() => onSend()}>Send ↗</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default () => (
    <ApolloProvider client={client}>
        <Chat />
    </ApolloProvider>
);