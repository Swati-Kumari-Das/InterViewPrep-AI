import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuAlertCircle, LuChevronDown } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';

const InterviewPrep = () => {
    const { sessionId } = useParams();

    const [sessionData, setSessionData] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
    const [explanation, setExplanation] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUpdateLoader, setIsUpdateLoader] = useState(false);

    // Fetch session data by session id
    const fetchSessionDetailsById = async () => {
        setIsLoading(true);
        try {
            // Replace with actual API call
            // const response = await getSessionById(sessionId);
            // setSessionData(response.data);
            setIsLoading(false);
        } catch (error) {
            setErrorMsg("Failed to fetch session details");
            toast.error("Failed to fetch session details");
            setIsLoading(false);
        }
    };

    // Generate Concept Explanation
    const generateConceptExplanation = async (question) => {
        setIsUpdateLoader(true);
        try {
            // Replace with actual API call
            // const response = await generateExplanation(question);
            // setExplanation(response.data);
            setOpenLearnMoreDrawer(true);
        } catch (error) {
            toast.error("Failed to generate explanation");
        } finally {
            setIsUpdateLoader(false);
        }
    };
     
    const toggleQuestionPinStatus= async(questionId) =>{};

    const uploadMoreQuestions=async()=>{

    }
    useEffect(() => {
        if (sessionId) {
            fetchSessionDetailsById();
        }
        return()=>{};
    }, []);

    return (
       <DashboardLayout>
         <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={
            sessionData?.updatedAt
                ? moment(sessionData.updatedAt).format("Do MMM YYYY")
                : ""
        }
    />
       </DashboardLayout>
    );
};

export default InterviewPrep;