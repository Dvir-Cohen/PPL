import { isNumber, isBoolean,isString } from "../shared/type-predicates";
import { isAtomicExp} from './L4-ast';





/*
;; <graph> ::= <header> <graphContent>                  // Graph(dir: Dir, content: GraphContent)
;; <header> ::= graph (TD|LR)<newline>                  // Direction can be TD or LR
;; <graphContent> ::= <atomicGraph> | <compoundGraph>
;; <atomicGraph> ::= <nodeDecl>
;; <compoundGraph> ::= <edge>+
;; <edge> ::= <node> --><edgeLabel>? <node><newline>    //  <edgeLabel> is optional
;;                                                          Edge(from: Node, to: Node, label?: string)
;; <node> ::= <nodeDecl> | <nodeRef>
;; <nodeDecl> ::= <identifier>["<string>"]              // NodeDecl(id: string, label: string)
;; <nodeRef> ::= <identifier>                           // NodeRef(id: string)
;; <edgeLabel> ::= |<identifier>|                       // string
*/

export type parsedMermeid = Node| Header |GraphContent|Graph |Edge | EdgeLabel;
export type Node = NodeRef|NodeDecl;
export type Header = TD|LR;
export type GraphContent = AtomicGraph | CompoundGraph;
type primitive = Number| Boolean| string ;


export interface Graph {tag: "Graph"; dir: Header, content: GraphContent ; }
export interface AtomicGraph {tag: "AtomicGraph"; body: NodeDecl; }
export interface CompoundGraph {tag: "CompoundGraph"; body: Edge[]; }
export interface Edge {tag: "Edge"; from: Node; to:Node; label?:EdgeLabel}
export interface NodeDecl {tag: "NodeDecl"; id:string; label: string; }
export interface NodeRef {tag: "NodeRef"; id: string; }
export interface EdgeLabel {tag: "EdgeLabel"; label:string| undefined; }
export interface TD {tag: "TD";}
export interface LR {tag: "LR";}


export const makeGraph = ( dir: Header, content: GraphContent): Graph => ({tag: "Graph",  dir:dir, content: content});
export const makeAtomicGraph = ( node: NodeDecl): AtomicGraph => ({tag: "AtomicGraph",  body: node});
export const makeCompoundGraph = ( edge: Edge[]): CompoundGraph => ({tag: "CompoundGraph",  body: edge });
export const makeEdge = ( from: Node, to:Node ,label:EdgeLabel): Edge => ({tag: "Edge",  from: from, to:to, label: label });
export const makeNodeDecl = ( id:string, label: string): NodeDecl => ({tag: "NodeDecl",  id:id, label:label });
export const makeNodeRef = ( id: string): NodeRef => ({tag: "NodeRef",  id:id });
export const makeEdgeLabel = ( label:string|undefined): EdgeLabel => ({tag: "EdgeLabel",  label:label });
export const makeTD = ():TD => ({tag: "TD"});
export const makeLR = ():LR => ({tag: "LR"});


export const isGraph = (x: any): x is Graph => x.tag === "Graph";
export const isHeader = (x: any): x is Header => isTD(x) || isLR(x) ;
export const isGraphContent = (x: any): x is GraphContent => isAtomicExp(x) || isCompoundGraph(x);
export const isAtomicGraph = (x: any): x is AtomicGraph => x.tag === "AtomicGraph";
export const isCompoundGraph = (x: any): x is CompoundGraph => x.tag === "CompoundGraph";
export const isEdge = (x: any): x is Edge => x.tag === "Edge";
export const isNode = (x: any): x is Node => isNodeDecl(x) || isNodeRef(x);
export const isNodeDecl = (x: any): x is NodeDecl => x.tag === "NodeDecl";
export const isNodeRef = (x: any): x is NodeRef => x.tag === "NodeRef";
export const isEdgeLabel = (x: any): x is EdgeLabel => x.tag === "EdgeLabel";
export const isTD = (x: any): x is TD => x.tag === "TD";
export const isLR = (x: any): x is LR => x.tag === "LR";
export const isprimitive = (x:any): x is primitive => (isNumber(x)||isBoolean(x)|| isString(x))

