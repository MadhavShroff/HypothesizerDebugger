import React from 'react'
import { Box, Typography } from "@mui/material";
import hljs from 'highlight.js';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import '../highlight/styles/base16/tomorrow.min.css';
hljs.registerLanguage('javascript', javascript);
hljs.highlightAll();

const styles = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    border: 2,
    marginTop: "1rem",
    width: '30vw',
    padding: "0rem 1rem 0rem 0rem",
    alignSelf: "center",
    borderRadius: 1 
};

type InfoListProps = {
    coverage:string[]
}

const CoverageBox: React.FC<InfoListProps> = (props: { coverage: string[]; }) : React.ReactElement => {
    let content = "";
    for(let i=0; i<props.coverage.length; i++) {
        content = content + props.coverage[i] + "\n";
    }
    if(content === "") return (<></>);
    hljs.highlightAll();
    const highlightedContent = hljs.highlight(
        content, 
        {language: 'javascript'}
    ).value;
    return (
        <Box sx={styles} >
            <Typography variant="button" display="block" component="div" fontWeight={700} style={{margin: "1rem 0rem 0.5rem 0rem", padding: "0rem 0rem 0rem 1rem"}}>
              Coverage :
            </Typography>
            <pre>
                <code 
                    className={"hljs language-javascript"} 
                    dangerouslySetInnerHTML={{__html: highlightedContent}}>
                </code>
            </pre>
        </Box>
    )
}

export default CoverageBox;