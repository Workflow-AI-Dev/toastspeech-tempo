import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  Star,
  Send,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  rating: number;
  comment: string;
}

interface Speaker {
  id: string;
  name: string;
  speechTitle: string;
  date: string;
  imageUrl: string;
}

interface MetaFeedback {
  id: string;
  date: string;
  evaluatorName: string;
  score: number;
  comment: string;
}

interface EvaluationToolsProps {
  speakers?: Speaker[];
  metaFeedback?: MetaFeedback[];
}

export default function EvaluationTools({
  speakers = [
    {
      id: "1",
      name: "Sarah Johnson",
      speechTitle: "The Power of Storytelling",
      date: "2023-10-15",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    {
      id: "2",
      name: "Michael Chen",
      speechTitle: "Innovation in Crisis",
      date: "2023-10-12",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    },
    {
      id: "3",
      name: "Priya Patel",
      speechTitle: "Leadership Lessons",
      date: "2023-10-08",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    },
  ],
  metaFeedback = [
    {
      id: "1",
      date: "2023-10-10",
      evaluatorName: "David Wilson",
      score: 4.5,
      comment:
        "Your evaluations are specific and actionable. Consider adding more examples to illustrate your points.",
    },
    {
      id: "2",
      date: "2023-09-25",
      evaluatorName: "Lisa Rodriguez",
      score: 4.2,
      comment:
        "Great balance of encouragement and constructive criticism. Work on timing to stay within the allotted evaluation period.",
    },
    {
      id: "3",
      date: "2023-09-15",
      evaluatorName: "James Taylor",
      score: 4.8,
      comment:
        "Excellent use of the sandwich method. Your evaluations are both kind and helpful.",
    },
  ],
}: EvaluationToolsProps) {
  const [activeTab, setActiveTab] = useState("evaluate");
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [evaluationForm, setEvaluationForm] = useState<EvaluationCriteria[]>([
    {
      id: "1",
      name: "Content Organization",
      description: "Structure, flow, and clarity of the speech",
      rating: 0,
      comment: "",
    },
    {
      id: "2",
      name: "Vocal Variety",
      description: "Pitch, tone, volume, and pace",
      rating: 0,
      comment: "",
    },
    {
      id: "3",
      name: "Body Language",
      description: "Gestures, movement, and eye contact",
      rating: 0,
      comment: "",
    },
    {
      id: "4",
      name: "Language Usage",
      description: "Grammar, vocabulary, and word choice",
      rating: 0,
      comment: "",
    },
    {
      id: "5",
      name: "Overall Impact",
      description: "Effectiveness and audience engagement",
      rating: 0,
      comment: "",
    },
  ]);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  const handleRatingChange = (id: string, rating: number) => {
    setEvaluationForm(
      evaluationForm.map((item) =>
        item.id === id ? { ...item, rating } : item,
      ),
    );
  };

  const handleCommentChange = (id: string, comment: string) => {
    setEvaluationForm(
      evaluationForm.map((item) =>
        item.id === id ? { ...item, comment } : item,
      ),
    );
  };

  const handleSubmitEvaluation = () => {
    // In a real app, this would submit the evaluation to a backend
    alert("Evaluation submitted successfully!");
    setSelectedSpeaker(null);
    setEvaluationForm(
      evaluationForm.map((item) => ({ ...item, rating: 0, comment: "" })),
    );
    setGeneralFeedback("");
  };

  const toggleFeedbackExpansion = (id: string) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  const renderStarRating = (
    rating: number,
    maxRating: number = 5,
    onRatingChange?: (rating: number) => void,
  ) => {
    return (
      <View className="flex-row">
        {[...Array(maxRating)].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onRatingChange && onRatingChange(index + 1)}
            disabled={!onRatingChange}
          >
            <Star
              size={24}
              color={index < rating ? "#FFD700" : "#D1D5DB"}
              fill={index < rating ? "#FFD700" : "transparent"}
              className="mr-1"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Tab Navigation */}
      <View className="flex-row mb-6 border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "evaluate" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setActiveTab("evaluate")}
        >
          <Text
            className={`text-center font-medium ${activeTab === "evaluate" ? "text-blue-500" : "text-gray-500"}`}
          >
            Evaluate Others
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "mySkills" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setActiveTab("mySkills")}
        >
          <Text
            className={`text-center font-medium ${activeTab === "mySkills" ? "text-blue-500" : "text-gray-500"}`}
          >
            My Evaluation Skills
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {activeTab === "evaluate" && (
          <View>
            {!selectedSpeaker ? (
              <>
                <Text className="text-lg font-bold mb-4">
                  Select a Speaker to Evaluate
                </Text>
                <FlatList
                  data={speakers}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-3 border border-gray-200"
                      onPress={() => setSelectedSpeaker(item)}
                    >
                      <View className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-3">
                        <Text className="text-center text-2xl leading-[48px] text-gray-600">
                          {item.name.charAt(0)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-800">
                          {item.name}
                        </Text>
                        <Text className="text-gray-600">
                          "{item.speechTitle}"
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Clock size={14} color="#6B7280" />
                          <Text className="text-xs text-gray-500 ml-1">
                            {item.date}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              </>
            ) : (
              <>
                <View className="flex-row items-center mb-6">
                  <TouchableOpacity
                    className="mr-3 bg-gray-100 p-2 rounded-full"
                    onPress={() => setSelectedSpeaker(null)}
                  >
                    <ChevronDown size={20} color="#4B5563" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold">
                    Evaluating: {selectedSpeaker.name}
                  </Text>
                </View>

                <Text className="text-gray-700 mb-2">
                  Speech: "{selectedSpeaker.speechTitle}"
                </Text>
                <Text className="text-gray-500 mb-6">
                  Date: {selectedSpeaker.date}
                </Text>

                {evaluationForm.map((criteria) => (
                  <View
                    key={criteria.id}
                    className="mb-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <Text className="font-bold text-gray-800 mb-1">
                      {criteria.name}
                    </Text>
                    <Text className="text-gray-600 text-sm mb-3">
                      {criteria.description}
                    </Text>

                    <Text className="text-gray-700 mb-2">Rating:</Text>
                    {renderStarRating(criteria.rating, 5, (rating) =>
                      handleRatingChange(criteria.id, rating),
                    )}

                    <Text className="text-gray-700 mt-4 mb-2">Comments:</Text>
                    <TextInput
                      className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800"
                      multiline
                      numberOfLines={3}
                      placeholder="Provide specific feedback..."
                      value={criteria.comment}
                      onChangeText={(text) =>
                        handleCommentChange(criteria.id, text)
                      }
                    />
                  </View>
                ))}

                <View className="mb-6">
                  <Text className="font-bold text-gray-800 mb-3">
                    General Feedback
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-gray-800"
                    multiline
                    numberOfLines={5}
                    placeholder="Provide overall feedback, highlighting strengths and areas for improvement..."
                    value={generalFeedback}
                    onChangeText={setGeneralFeedback}
                  />
                </View>

                <TouchableOpacity
                  className="bg-blue-500 py-4 px-6 rounded-lg items-center flex-row justify-center mb-8"
                  onPress={handleSubmitEvaluation}
                >
                  <Send size={20} color="#FFFFFF" className="mr-2" />
                  <Text className="text-white font-bold text-lg">
                    Submit Evaluation
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {activeTab === "mySkills" && (
          <View>
            <View className="bg-blue-50 p-4 rounded-lg mb-6">
              <Text className="text-lg font-bold text-blue-800 mb-2">
                Your Evaluation Score
              </Text>
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-blue-600 mr-3">
                  4.5
                </Text>
                {renderStarRating(4.5)}
              </View>
              <Text className="text-blue-700 mt-2">
                Based on feedback from 8 evaluations
              </Text>
            </View>

            <Text className="text-lg font-bold mb-4">
              Meta-Feedback on Your Evaluations
            </Text>

            {metaFeedback.map((feedback) => (
              <View
                key={feedback.id}
                className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <User size={16} color="#4B5563" />
                    <Text className="ml-1 text-gray-700">
                      {feedback.evaluatorName}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm">{feedback.date}</Text>
                </View>

                <View className="flex-row items-center mt-2 mb-2">
                  <Text className="text-gray-700 mr-2">Score:</Text>
                  {renderStarRating(feedback.score)}
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-700 font-medium">Feedback:</Text>
                  <TouchableOpacity
                    onPress={() => toggleFeedbackExpansion(feedback.id)}
                  >
                    {expandedFeedback === feedback.id ? (
                      <ChevronUp size={20} color="#4B5563" />
                    ) : (
                      <ChevronDown size={20} color="#4B5563" />
                    )}
                  </TouchableOpacity>
                </View>

                {expandedFeedback === feedback.id && (
                  <Text className="text-gray-600 mt-2">{feedback.comment}</Text>
                )}
              </View>
            ))}

            <View className="bg-yellow-50 p-4 rounded-lg mb-6">
              <Text className="text-lg font-bold text-yellow-800 mb-2">
                Tips to Improve
              </Text>
              <View className="mb-2">
                <Text className="text-yellow-700 font-medium">
                  • Be specific with examples
                </Text>
                <Text className="text-yellow-600">
                  Illustrate your points with concrete examples from the speech.
                </Text>
              </View>
              <View className="mb-2">
                <Text className="text-yellow-700 font-medium">
                  • Balance encouragement and criticism
                </Text>
                <Text className="text-yellow-600">
                  Use the sandwich method: start and end with positives.
                </Text>
              </View>
              <View>
                <Text className="text-yellow-700 font-medium">
                  • Focus on actionable advice
                </Text>
                <Text className="text-yellow-600">
                  Provide clear steps the speaker can take to improve.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
