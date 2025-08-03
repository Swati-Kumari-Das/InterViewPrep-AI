import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuChevronDown,LuListCollapse } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import { LuTriangleAlert} from 'react-icons/lu';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import AIResponsePreview from './components/AIResponsePreview';
const InterviewPrep = () => {
    const { sessionId } = useParams();
    const [sessionData, setSessionData] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [error, setError] = useState(null); // ✅ Add this

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
              const response = await axiosInstance.get(
                API_PATHS.SESSION.GET_ONE(sessionId)
            );
            if (response.data && response.data.session) {
                setSessionData(response.data.session);
            }
          
        } catch (error) {
            console.log("Error:",error);
        }
    };

    // Generate Concept Explanation
    const generateConceptExplanation = async (question) => {
    try {
        setErrorMsg("");
        setExplanation(null);
        setIsLoading(true);
        setOpenLearnMoreDrawer(true);

        const response = await axiosInstance.post(
            API_PATHS.AI.GENERATE_EXPLANATION,
            { question }
        );

        if (response.data) {
            setExplanation(response.data);
        }
    } 
    
    // catch (error) {
    //     setExplanation(null);
    //     setErrorMsg("Failed to generate explanation. Try again later.");
    //     console.error("Error:", error);
    // }
    
    
    catch (error) {
    setExplanation(null);

    const serverMsg = error?.response?.data?.error || "";
    const isOverloaded = serverMsg.includes("overloaded") || serverMsg.includes("UNAVAILABLE");

    if (isOverloaded) {
        setErrorMsg("The AI model is currently overloaded. Please try again later.");
    } else {
        setErrorMsg("Failed to generate explanation. Try again later.");
    }

    console.error("Backend responded with error:", error?.response?.data);
}

    
    finally {
        setIsLoading(false);
    }
};
     
    const toggleQuestionPinStatus = async (questionId) => {
    try {
        const response = await axiosInstance.patch(
            API_PATHS.QUESTION.PIN(questionId)
        );
        
        console.log(response);
        
        if (response.data && response.data.question) {
            // toast.success('Question pinned successfully!');
            fetchSessionDetailsById();
        }
    } catch (error) {
        console.error("Error toggling pin status:", error);
        // toast.error('Failed to update pin status');
    }
};

    // Add more questions to a session
const uploadMoreQuestions = async () => {
    try {
        console.log("⏳ Starting uploadMoreQuestions...");
        setIsUpdateLoader(true);
       // setError(null); // Clear previous errors
       
         // Log the session data being sent
        console.log("📦 Sending to AI API:", {
            role: sessionData?.role,
            experience: sessionData?.experience,
            topicsToFocus: sessionData?.topicsToFocus,
            numberOfQuestions: 10,
        });

        // Call AI API to generate questions
        const aiResponse = await axiosInstance.post(
            API_PATHS.AI.GENERATE_QUESTIONS,
            {
                role: sessionData?.role,
                experience: sessionData?.experience,
                topicsToFocus: sessionData?.topicsToFocus,
                numberOfQuestions: 10,
            }
        );

        console.log("✅ AI response:", aiResponse.data);

        // Should be array like [{question, answer}, ...]
        const generatedQuestions = aiResponse.data;

         console.log("📩 Sending questions to ADD_TO_SESSION API:", {
            sessionId,
            questions: generatedQuestions,
        });
        const response = await axiosInstance.post(
            API_PATHS.QUESTION.ADD_TO_SESSION,
            {
                sessionId,
                questions: generatedQuestions,
            }
        );
        console.log("✅ Session update response:", response.data);

        if (response.data) {
            toast.success("Added More Q&A!");
            fetchSessionDetailsById();
        }
    } catch (error) {
        console.error("❌ uploadMoreQuestions failed:", error);
        if (error.response && error.response.data.message) {
             console.error("❌ Error Response Data:", error.response.data);
            setError(error.response.data.message);
        } else {
             console.error("❌ Unknown Error:", error.message);
            setError("Something went wrong. Please try again.");
        }
    } finally {
         console.log("✅ Finished uploadMoreQuestions");
        setIsUpdateLoader(false);
    }
};
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
   <div className="container mx-auto  pt-4 pb-4 px-4 ">
   <h2 className="text-lg font-semibold color-black">Interview Q & A</h2>
  
    <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
    <div
      className={`col-span-12 ${
        openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"
      }`}
    >
      <AnimatePresence>
        {sessionData?.questions?.map((data, index) => {
          return (
            <motion.div
              key={data._id || index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.4,
                type: "spring",
                stiffness: 100,
                delay: index * 0.1,
                damping: 15,
              }}
              layout //this is the key prop that animates position changes
              layoutId={`question-${data._id || index}`} // Helps Framer track
            >
              <>
              <QuestionCard
                question={data?.question}
                answer={data?.answer}
                onLearnMore={() => generateConceptExplanation(data.question)}
                isPinned={data?.isPinned}
                onTogglePin={() => toggleQuestionPinStatus(data._id)}
              />
             

              {!isLoading && sessionData?.questions?.length === index + 1 && (
              <div className="flex items-center justify-center mt-5">
                <button
                  className="flex items-center gap-3  text-sm font-medium text-white bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer "
                  disabled={isLoading || isUpdateLoader}
                  onClick={uploadMoreQuestions}
                >
                  {isUpdateLoader ? (
                    <SpinnerLoader size="small" />
                  ) : (
                    <LuListCollapse className="text-lg" />
                  )}
                  Load More
                </button>
             </div>
)}
            </>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  </div>
   
<div>
    <Drawer
        isOpen={openLearnMoreDrawer}
        onClose={() => setOpenLearnMoreDrawer(false)}
        title={!isLoading && explanation?.title}
    >
        {errorMsg && (
            <p className="flex gap-2 text-sm text-amber-600 font-medium">
                <LuCircleAlert className="mt-1" />
                {errorMsg}
            </p>
        )}
        {isLoading && <SkeletonLoader />}
        {!isLoading && explanation && (
            <AIResponsePreview content={explanation?.explanation} />
        )}
    </Drawer>
  </div>
  </div>
   
       </DashboardLayout>
    );
};

export default InterviewPrep;