import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { StoryListing } from "./pages/StoryListing";
import { StoryDetails } from "./pages/StoryDetails";
import { ReadingMode } from "./pages/ReadingMode";
import { EndOfStory } from "./pages/EndOfStory";
import { MyStories } from "./pages/MyStories";
import { StoryEditor } from "./pages/StoryEditor";
import { StoryFlowView } from "./pages/StoryFlowView";
import { Admin } from "./pages/Admin";
import GamePlayer from "./pages/GamePlayer"; // Integrated from Target

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stories" element={<StoryListing />} />
        <Route path="/story/:id" element={<StoryDetails />} />
        <Route path="/read/:id" element={<ReadingMode />} />
        <Route path="/story/:id/ending" element={<EndOfStory />} />
        <Route path="/my-stories" element={<MyStories />} />
        <Route path="/editor/:id" element={<StoryEditor />} />
        <Route path="/editor/:id/flow" element={<StoryFlowView />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Integrated GamePlayer Route */}
        <Route path="/play/:sessionId" element={<GamePlayer />} />
      </Routes>
    </Router>
  );
}
