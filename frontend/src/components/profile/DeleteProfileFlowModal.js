import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

const DeleteProfileFlowModal = ({
  modalState,
  toggle,
  onDelete,
  userStories = [],
}) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("delete_all"); // delete_all | keep_all | keep_selected
  const visibleStories = useMemo(() => userStories || [], [userStories]);

  const [selectedIds, setSelectedIds] = useState(() =>
    visibleStories.length ? visibleStories.map((s) => s.id) : []
  );

  // Reset whenever modal opens
  useEffect(() => {
    if (modalState) {
      setStep(1);
      setMode("delete_all");
      setSelectedIds(visibleStories.length ? visibleStories.map((s) => s.id) : []);
    }
  }, [modalState, visibleStories]);

  // Keep selectedIds in sync if stories load later
  useEffect(() => {
  if (modalState) {
    setStep(1);
    setMode("delete_all");
    setSelectedIds(
      visibleStories.length ? visibleStories.map((s) => s.id) : []
    );
  }
}, [modalState, visibleStories]);

  useEffect(() => {
  const hasSelectionStep = mode === "keep_selected" && visibleStories.length > 0;

  if (step === 2 && !hasSelectionStep) {
    setStep(1);
  }
}, [step, mode, visibleStories.length]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onNext = () => setStep((s) => Math.min(3, s + 1));

  const onBack = () => {
    const hasSelectionStep = mode === "keep_selected" && visibleStories.length > 0;

    if (step === 3 && !hasSelectionStep) {
      setStep(1);
      return;
    }

    setStep((s) => Math.max(1, s - 1));
  };

  
  const step1Continue = () => {
    if (mode === "keep_selected" && visibleStories.length > 0) {
      setStep(2); // selection step
    } else {
      setStep(3); // skip summary step
    }
  };

  const confirmAndDelete = async () => {
    // If keep_selected but there are no stories, treat as keep_all
    const effectiveMode =
      mode === "keep_selected" && visibleStories.length === 0 ? "keep_all" : mode;

    let options;
    if (effectiveMode === "keep_all") {
      options = { storyMode: "keep_all" };
    } else if (effectiveMode === "keep_selected") {
      options = { storyMode: "keep_selected", keepStoryIds: selectedIds };
    } else {
      options = { storyMode: "delete_all" };
    }

    try {
      await onDelete(options);
    } catch (err) {
      console.error("delete failed", err);
    } finally {
      toggle();
    }
  };

  const renderStep1 = () => (
    <>
      <p>Are there stories you want to preserve before deleting your profile?</p>

      <div className="delete-flow-options">
        <Button
          className={`delete-flow-option-btn ${mode === "keep_all" ? "is-selected" : ""}`}
          onClick={() => setMode("keep_all")}
        >
          preserve all stories
        </Button>

        <Button
          className={`delete-flow-option-btn ${mode === "delete_all" ? "is-selected" : ""}`}
          onClick={() => setMode("delete_all")}
        >
          Delete all stories
        </Button>

        <Button
          className={`delete-flow-option-btn ${mode === "keep_selected" ? "is-selected" : ""}`}
          onClick={() => setMode("keep_selected")}
        >
          preserve selected stories
        </Button>
      </div>

      {mode === "keep_selected" && visibleStories.length === 0 && (
        <p className="text-muted" style={{ marginTop: 10 }}>
          You don&apos;t have any stories yet - selecting stories isn&apos;t needed.
          Continuing will behave like “keep all stories”.
        </p>
      )}

      <div style={{ marginTop: 8 }}>
        <small className="text-muted">
          Tip: you can preview and select stories in the next step.
        </small>
      </div>
    </>
  );


  const renderStep2 = () => (
    <>
      <p>Select the stories you want to keep.</p>
      <Form>
        <FormGroup>
          {visibleStories.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #eee",
                padding: "10px 12px",
                marginBottom: 10,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Input
                type="checkbox"
                checked={selectedIds.includes(s.id)}
                onChange={() => toggleSelect(s.id)}
                id={`keep-${s.id}`}
              />
              <Label
                for={`keep-${s.id}`}
                style={{ margin: 0, cursor: "pointer", width: "100%" }}
              >
                <strong>{s.title || "Untitled"}</strong>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {s.description
                    ? (() => {
                        const text = s.description.replace(/<[^>]+>/g, "");
                        return text.length > 120
                          ? text.substring(0, 120) + "..."
                          : text;
                      })()
                    : ""}
                </div>
              </Label>
            </div>
          ))}
        </FormGroup>
      </Form>
    </>
  );

  const renderStep3 = () => {
    const effectiveMode =
      mode === "keep_selected" && visibleStories.length === 0 ? "keep_all" : mode;

    return (
      <>
        <h5>Confirm</h5>

        {effectiveMode === "keep_all" && (
          <p>
            Your profile will be permanently deleted.
            <br />
            <br />
            All your stories will stay published, but your name and profile information will be removed.
            They will appear as posted by an anonymous user.
          </p>
        )}

        {effectiveMode === "delete_all" && (
          <p>
            This will permanently delete your profile and <strong>all</strong>{" "}
            your stories.
          </p>
        )}

        {effectiveMode === "keep_selected" && (
          <p>
            This will permanently delete your profile and all of your stories except
            the <strong>{selectedIds.length}</strong> you selected. The selected stories
            will remain published but will appear as posted by an anonymous user.
          </p>
        )}

        <p style={{ color: "#b00" }}>
          This action cannot be undone.
        </p>
      </>
    );
  };

  return (
    <Modal
      className="delete-flow-modal"
      isOpen={modalState}
      toggle={toggle}
      size="lg"
      aria-labelledby="delete-profile-flow"
      centered
    >
      <ModalHeader toggle={toggle}>delete profile</ModalHeader>

      <ModalBody>
        {step === 1 && renderStep1()}

        {step === 2 && mode === "keep_selected" && visibleStories.length > 0 && renderStep2()}

        {step === 3 && renderStep3()}
      </ModalBody>

      <ModalFooter className="delete-flow-actions">
        {step > 1 && (
          <Button className="delete-flow-outline" onClick={onBack}>
            back
          </Button>
        )}

        {step < 3 && (
          <Button
            className="delete-flow-continue"
            color="primary"
            onClick={step === 1 ? step1Continue : onNext}
          >
            {step === 1 ? "continue" : "next"}
          </Button>
        )}

        {step === 3 && (
          <>
            <Button
              color="danger"
              className="delete-confirm-btn"
              onClick={confirmAndDelete}
            >
              Yes, delete my profile
            </Button>
            <Button className="delete-flow-outline" onClick={toggle}>
              cancel
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DeleteProfileFlowModal;