import React  from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, gpl, useQuery } from "@apollo/client";

const client = new ApolloClient({
    uri: "http://localhost:4000/",
    cache: new InMemoryCache(),
});

const GET_MESSAGES = gpl`
query {
    messages {
        id
        content
        user
    }
}
`;

const Chat = () => {
    return <div>Im a chat window</div>;
};

export default () => (
    <ApolloProvider client={client}>
        <Chat></Chat>
    </ApolloProvider>
);