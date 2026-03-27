import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { userFlagPin, clearPin } from "../../../actions/pins";
import { userFlagComment } from "../../../actions/auth";
const useFlagForm = () => {
  const [flagModalState, setflagModalState] = useState(false);
  const [flagCommentModalState, setflagCommentModalState] = useState(false);
  const [flagForm, setflagForm] = useState("");
  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  const dispatch = useDispatch();
  const history = useHistory();
  const flagToggle = (id) => {
    setflagModalState(!flagModalState);
    setflagForm({
      pinId: id,
      flagger: user.id,
      flagged: true,
    });
  };
  const flagCommentToggle = (id) => {
    setflagCommentModalState(!flagCommentModalState);
    setflagForm({
      comment: id,
      flagger: user.id,
      flagged: true,
    });
  };
  const handleFlagFormChange = (e) => {
    e.persist();
    setflagForm((flagForm) => ({
      ...flagForm,
      [e.target.name]: e.target.value,
    }));
  };
  const onFlagSubmit = (e) => {
    e.preventDefault();
    // dispatch will return a promise, a value that will be available once it's resolved or rejected
    dispatch(userFlagPin(flagForm))
      .then(() => {
        setflagModalState(!flagModalState);
        // after API resolved, clear current pin and navigate home
        dispatch(clearPin());
        history.push("/");
      })
      .catch(() => {
        // after API rejected, optionally handle error, leave modal open
        setflagModalState(!flagModalState);
      });
  };
  const onFlagCommentSubmit = (e) => {
    e.preventDefault();
    dispatch(userFlagComment(flagForm));
    setflagCommentModalState(!flagCommentModalState);
  };
  return {
    flagForm,
    flagToggle,
    flagCommentToggle,
    flagCommentModalState,
    flagModalState,
    onFlagSubmit,
    onFlagCommentSubmit,
    handleFlagFormChange,
  };
};

export default useFlagForm;
