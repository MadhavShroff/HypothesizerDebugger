import { State } from "./finalTypes";

export interface ProfilerOutput {
    trace:        ProfilerOutputTraceElement[];
    profile:      ProfilerOutputProfileElement[];
    bundleAndMap: Array<[
        string,
        BundleAndMapClass
    ]>;
    allFiles:     {
        url:     string;
        content: string;
    }[];
}

export interface ProfilerOutputProfileElement {
    callFrame:      {
        columnNumber: number;
        functionName: string;
        lineNumber:   number;
        scriptId:     string;
        url:          string;
    };
    children?:      number[];
    hitCount:       number;
    id:             number;
    functionName:   string;
    positionTicks?: {
        line:  number;
        ticks: number;
    }[];
}

export interface ProfilerOutputTraceElement {
    functionName:    string;
    isBlockCoverage: boolean;
    ranges:          {
        count:       number;
        endOffset:   number;
        startOffset: number;
    }[];
    url:             string;
    timestamp:       number;
}

export interface BundleAndMapClass {
    version:        number;
    file:           string;
    sources:        string[];
    sourcesContent: string[];
    mappings:       string;
    sourceRoot:     string;
}

export type TemporaryEventType = {
    state: State;
    target?:        string; // "text" | "submit" | "button";
    type:           "attributes" | "childList" | "click" | "keydown";
    location:       {
      fileName:     string;
      lineNumber:   number;
      columnNumber: number;
    };
    srcElement?:    {
      value:   string;
      tagName: string; // "BUTTON" | "INPUT"
    };
    timestamp:      number;
    key?:           string;
    addNode?:       Location[];
    removeNode?:    Location[];
    attributeName?: null | string;
    value?:         string;
    tagName?:       string; // "BUTTON" | "INsPUT"
  }