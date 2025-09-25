import { useAtomValue, useSetAtom } from "jotai";
import { isClickedAtom } from "../utilities/utilities";

export const Modal = ({ title, description, link }) => {
  const isClicked = useAtomValue(isClickedAtom);
  const setIsClicked = useSetAtom(isClickedAtom);
  // console.log(isClicked);
  return (
    <div className={`modal ${isClicked ? "" : "hidden"}`}>
      <div className="modal-wrapper">
        <div className="modal-header">
          <h1 className="modal-title">{title}</h1>
          <button
            onClick={() => setIsClicked(false)}
            className="modal-exit-button"
          >
            exit
          </button>
        </div>
        <div className="modal-content">
          <div className="modal-content-wrapper">
            <a
              className={`modal-project-visit-button ${link ? "" : "hidden"}`}
              href={link}
              target="_blank"
            >
              View Project
            </a>
            <div className="modal-project-description">{description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
