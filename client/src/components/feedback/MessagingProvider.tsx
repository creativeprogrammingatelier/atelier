import React, { useContext, createContext, useState, Fragment } from "react";
import { randomBytes } from "crypto";
import { Alert } from "react-bootstrap";

/** A message to show the user at the top of the screen */
export interface Message {
    readonly type: "info" | "success" | "warning" | "danger",
    readonly message: string
}

/** The messaging context, used to handle reading and creating messages */
export interface Messaging {
    readonly messages: Message[],
    readonly addMessage: (message: Message, timeout?: number) => string,
    readonly removeMessage: (ID: string) => void
}

/** 
 * A React Context for messaging. A context is used to provide messaging to all 
 * components, without the need to pass down messaging functions as properties. 
 */
const messagingContext = createContext<Messaging>({ messages: [], addMessage: mes => "", removeMessage: id => {} });

/** 
 * Displays messages at the top of the screen and allows child elements access 
 * to the messaging context using the useMessaging hoook.
 */
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

/** Get the Messaging context, to read or create messages */
export function useMessaging() {
    return useContext(messagingContext);
}