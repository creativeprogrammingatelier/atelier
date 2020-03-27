import React, { useContext, createContext, useState, Fragment } from "react";
import { randomBytes } from "crypto";
import { Alert } from "react-bootstrap";

export interface Message {
    readonly type: "info" | "success" | "warning" | "danger",
    readonly message: string
}

export interface Messaging {
    readonly messages: Message[],
    readonly addMessage: (message: Message, timeout?: number) => string,
    readonly removeMessage: (ID: string) => void
}

const messagingContext = createContext<Messaging>({ messages: [], addMessage: mes => "", removeMessage: id => {} });

export function MessagingProvider({children}: { children: React.ReactNode }) {
    const [messages, updateMessages] = useState([] as Array<Message & { ID: string }>);

    const messaging: Messaging = {
        messages,
        removeMessage(ID) {
            updateMessages(messages => messages.filter(mes => mes.ID !== ID));
        },
        addMessage(message, timeout = 9000) {
            const id = randomBytes(32).toString('hex');
            console.log(message.type, "-", message.message);
            updateMessages(messages => messages.concat({ ...message, ID: id }));
            setTimeout(() => this.removeMessage(id), timeout);
            return id;
        }
    }

    return (
        <messagingContext.Provider value={messaging}>
            <div className="messages">
                {messages.map(mes => 
                    <Alert 
                        dismissible 
                        variant={mes.type} 
                        className="my-2" 
                        onClose={() => messaging.removeMessage(mes.ID)}>
                            {mes.message}
                    </Alert>
                )}
            </div>
            <Fragment>{children}</Fragment>
        </messagingContext.Provider>
    );
}

export function useMessaging() {
    return useContext(messagingContext);
}