/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import './Timeline.css';
import React from 'react';
import { Filter, TimelineItem} from '../../types/finalTypes'
import { TextBox, Dot, ContentLine } from "./styledComponents";

type TimelinePropType = {
  setCoverage:  React.Dispatch<React.SetStateAction<string[]>>,
  itemList: TimelineItem[],
  filters: Filter[]
}

const getRowColorFromType = (type: string) : string => {
  const color = "#bcebef";
  if(type === "event")
    return "#A5C9CA"; // light blue    
  else if(type === "function")
    return "#FAD9A1"; // light orange
  else return color;
}

function Timeline({setCoverage, itemList, filters} : TimelinePropType): JSX.Element {
  const [page, setPage] = React.useState(1); // allows for pagination
  const [selectedItem, setSelectedItem] = React.useState(-1); // refers to the dot number that is selected. -1 => no item selected
  const itemCount = 30;
  console.log("Timeline Recvd items: ", itemList);
  if(itemList.length === 0) return <h2>No Items to Display</h2>
  return (
    <div id="react-timeline-container">
      <div className="timeline-wrapper" style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "row"
      }}>
        <ContentLine id='content'>
          {itemList
            .filter((i, index: number) => index < page * itemCount && index >= (page - 1) * itemCount)
            .map((item : TimelineItem, index: number) => {
              index = index + (page * itemCount);
              return <div  // RowContainer
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "left"
                }}
                key={index}
                className={selectedItem === index ? "selected" : ""}
                onClick={() => {
                  setCoverage(item.coverage ? item.coverage : []);
                  setSelectedItem(index);
                }}>  
                <Dot className="dot" id={`dot${index}`} style={{
                  background: getRowColorFromType(item.type)
                }}>
                  {item.icon}
                </Dot>
                <TextBox style={{
                  background: getRowColorFromType(item.type)
                }}>{item.title}</TextBox>
                <TextBox 
                  style={{height: "30px", width: "50px", marginLeft: "5px", background: "#94B49F"}} 
                >{item.timestamp}</TextBox>
                <TextBox 
                  style={{height: "27px", width: "20px", marginLeft: "5px", background: "#dfdfdf"}} 
                  hidden={selectedItem === index ? false : true}
                  onClick={() => {
                    console.log("selected item:", item);
                  }}
                >+</TextBox>
              </div>;
            })}
          {page > 1 && <button onClick={() => setPage(page - 1)}> Previous Page </button>}
          {page <= itemList.length / itemCount && <button onClick={() => setPage(page + 1)}> Next Page </button>}
        </ContentLine>
      </div>
    </div>
  );
}

export default Timeline;
