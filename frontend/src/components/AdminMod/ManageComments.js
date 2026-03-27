import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card } from "reactstrap";
const config = {
  headers: {
    "X-Arqive-Api-Key": process.env.REACT_APP_API_KEY,
  },
};

export default function ManageComments() {
  const [flagComments, setflagComments] = useState("");
  const [showReport, setshowReport] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(true);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_ARQIVE}/commentStory/`, config)
      .then((res) => {
        setflagComments(res.data);
      })
      .catch

      // => console.log(error)
      ();
    // Removed flagComments from dependencies arrray was 
    // causing an infinte loop
  }, []);

  const toggleReports = (id) => {
    setshowReport((prevshowReport) => ({
      ...showReport,
      [id]: !prevshowReport[id],
    }));
  };
  const onDeleteComment = (id) => {
    axios
      .delete(`${process.env.REACT_APP_ARQIVE}/commentStory/${id}/`, config)
      .then((res) => {
        setflagComments(flagComments.filter((comment) => comment.id !== id));
      })
      .catch

      // => console.log(error)
      ();
  };
  return (
    <div>
      {flagComments && (
        <DisplayComments
          comments={flagComments}
          onDelete={onDeleteComment}
          toggleReports={toggleReports}
          showReport={showReport}
          onlyFlagged={onlyFlagged}
          setOnlyFlagged={setOnlyFlagged}
        />
      )}
    </div>
  );
}

const DisplayComments = (props) => {
  const displayComments = props.onlyFlagged
    ? props.comments.filter((c) => c.flagscore > 0)
    : props.comments;
  
  return (
    <div className="container-fluid manage-container">
      manage flagged comments
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={props.onlyFlagged}
            onChange={() => props.setOnlyFlagged((s) => !s)}
          />
          Show only flagged comments
        </label>
      </div>
      <Card className={"manage-card"} style={{ minHeight: 300 }}>
        <table className="table manage-table table-responsive-sm table-responsive-md" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="manage-table-head">
            <th style={{ width: '12%' }}>User </th>
            <th style={{ width: '25%' }}>Comment</th>
            <th style={{ width: '12%' }}>number of flags</th>
            <th style={{ width: '15%' }}>action</th>
            <th style={{ width: '20%' }}>reason</th>
            <th style={{ width: '16%' }}>link to story</th>
          </thead>
          <tbody>
            {displayComments.map((comment) => {
              return (
                <tr key={comment.id}>
                  <td>{comment.username ? comment.username : "Anonymous"}</td>
                  <td>{comment.description}</td>
                  <td>{comment.flagscore} flags</td>
                  <td>
                    <button
                      onClick={() => props.onDelete(comment.id)}
                      className="btn btn-sm default-btn-purple"
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => props.toggleReports(comment.id)}
                      className="btn btn-sm default-btn-purple"
                    >
                      Show Reports
                    </button>
                    {props.showReport[comment.id]
                      ? comment.flaggingComment && (
                          <CommentReports reports={comment.flaggingComment} />
                        )
                      : ""}
                  </td>
                  <td>
                    <Link
                      className="sidebar-story-read-more"
                      to={`/Story/${comment.pin}`}
                    >
                      view story
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const CommentReports = (props) => {
  return (
    <ul>
      {props.reports.length > 0
        ? props.reports.map((report) => {
            return <li key={report.id}>{report.reason}</li>;
          })
        : "none"}
    </ul>
  );
};
