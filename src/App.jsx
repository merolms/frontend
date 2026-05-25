import React,{useState} from "react";
// import Sidebar from "@/app/components/Sidebar";
import SideBar from '@/app/containers/SideBar/SideBar'
import Header from "@/app/components/Header";

const App = () => {
    const [visible, toggleVisibiltiy]=useState(false)
    const invertVisibility =()=> {
        if(visible) {
            toggleVisibiltiy(false)
        }else {
            toggleVisibiltiy(true)
        }
    }
    return (
        <>
            <Header toggleVisibiltiy={invertVisibility}/>
            <SideBar visible={visible}/>
        </>
    )
};

export default App;