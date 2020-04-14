import React, {useState, Fragment} from "react";
import {Comment} from "../../../../models/api/Comment";
import {Button} from "react-bootstrap";
import {FiClipboard, FiCopy, FiDelete, FiTrash} from "react-icons/all";
import {ButtonBar} from "../input/button/ButtonBar";
import {ButtonMultistate} from "../input/button/ButtonMultistate";
import {CopyHelper} from "../../helpers/CopyHelper";
import {TimeHelper} from "../../helpers/TimeHelper";

interface CommentProperties {
    comment: Comment
}

export function Comment({comment}: CommentProperties) {
    const [menuOpen, setMenuOpen] = useState(false);
    let timer: NodeJS.Timeout;
    const handleDown = () => {
        if (menuOpen) {
            setMenuOpen(false);
        } else {
            timer = setTimeout(() => {
                setMenuOpen(true);
            }, 1000);
        }
    };
    const handleUp = () => {
        window.clearTimeout(timer);
    };
    const handleCopy = () => {
        CopyHelper.copy(comment.text);
        setMenuOpen(false);
    };
    const handleDelete = () => {
        // TODO: Send request
        console.log("Deleting a thing");
        setMenuOpen(false);
    };

    return <Fragment>
        <div className="comment px-2 py-1" onMouseDown={handleDown} onMouseUp={handleUp} onTouchStart={handleDown} onTouchEnd={handleUp}>
            <small><span>{comment.user.name}</span> at <span>{TimeHelper.toDateTimeString(TimeHelper.fromString(comment.created))}</span></small>
            <div>{comment.text}</div>
        </div>
        {
            menuOpen &&
            <ButtonBar transparent align="left">
                <Button className="m-2" onClick={handleCopy}>Copy <FiClipboard/></Button>
                <ButtonMultistate variant="danger" className="m-2 ml-0" states={[
                    <Fragment>Delete <FiTrash/></Fragment>,
                    <Fragment>Confirm <FiTrash/></Fragment>
                ]} finish={handleDelete}/>
            </ButtonBar>
        }
    </Fragment>;
}