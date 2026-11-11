# 🫁 Pulmonary Tuberculosis Detection – AI Agent

An AI-powered Pulmonary Tuberculosis (TB) Detection System that analyzes chest X-ray images using Deep Learning to identify potential signs of tuberculosis.

The project uses a **DenseNet121-based deep learning model** to classify chest X-ray images and generate screening results. It also integrates **Grad-CAM (Gradient-weighted Class Activation Mapping)** to visually highlight regions of the X-ray that influence the model's predictions, improving the interpretability of AI-generated results.

## ✨ Key Features

- **AI-Based TB Detection:** Analyzes chest X-ray images to identify potential tuberculosis indicators.
- **Deep Learning Classification:** Uses a DenseNet121 architecture for image classification.
- **Grad-CAM Visualization:** Generates heatmap overlays to highlight important regions influencing predictions.
- **Risk Assessment:** Provides risk-level classification based on prediction results.
- **Confidence Score:** Displays the model's confidence in its prediction.
- **Lung Zone Analysis:** Provides a spatial assessment of different lung regions.
- **Image Quality Assessment:** Evaluates image resolution, exposure, and inhalation quality.
- **Clinical Recommendations:** Generates screening recommendations based on the analysis.
- **Interactive Dashboard:** Provides a web-based interface for interacting with the detection system.
- **CLI Support:** Allows users to analyze chest X-ray images directly through the command line.

## 🧠 AI and Machine Learning Concepts

| Concept | Application |
|---|---|
| DenseNet121 | Deep learning architecture used for chest X-ray classification. |
| CNN | Extracts relevant visual features from X-ray images. |
| Transfer Learning | Uses a pretrained model architecture for medical image classification. |
| Grad-CAM | Produces visual heatmaps explaining model predictions. |
| Image Preprocessing | Prepares X-ray images for model inference. |
| Model Evaluation | Evaluates model performance using test data and evaluation metrics. |
| Class Imbalance Handling | Uses class imbalance weighting during model training. |

## 🛠️ Technologies Used

**AI / Machine Learning**
- Python
- PyTorch
- Torchvision
- DenseNet121
- OpenCV
- NumPy
- Scikit-learn
- Grad-CAM

**Backend**
- FastAPI
- Uvicorn
- Pydantic

**Frontend**
- React
- TypeScript
- HTML5
- Tailwind CSS
- Vite
- Recharts
- Lucide React

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or above
- Node.js and npm
- Git
- A modern web browser

### Step 1: Clone the Repository

```bash
git clone https://github.com/akshayashreecode038/pulmonary-tuberculosis-detect-ai-agent.git
```

Navigate into the project directory:

```bash
cd pulmonary-tuberculosis-detect-ai-agent
```

### Step 2: Install Python Dependencies

```bash
pip install -r ai-agent/requirements.txt
```

### Step 3: Download the Trained Model Weights

The trained DenseNet121 model checkpoint is hosted on Google Drive because of its large file size and is not included directly in the GitHub repository.

**Download the model weights here:**

[📥 Download tb_densenet121_best.pt – Google Drive](https://drive.google.com/file/d/1JyLXqy83BNFeEI1f9XVMlXjRSSY7ubqn/view?usp=sharing)

After downloading, place the file inside the following directory:

```text
ai_agent/
└── models_ckpt/
    └── tb_densenet121_best.pt
```

**Important:**
- Download the model checkpoint from the Google Drive link provided above.
- Make sure the downloaded file is named exactly `tb_densenet121_best.pt`.
- Place it inside `ai_agent/models_ckpt/`.
- Ensure the model weights are available before running the AI detection system.

The application requires this pretrained checkpoint to perform chest X-ray analysis and generate tuberculosis detection predictions.
```text
ai_agent/
└── models_ckpt/
    └── tb_densenet121_best.pt
```

**Important:** The model checkpoint is required to run inference using the trained model.

### Step 4: Install Frontend Dependencies

Open a terminal in the project root and execute:

```bash
npm install
```

### Step 5: Start the Backend Server

Open a terminal and run:

```bash
python -m uvicorn ai_agent.api.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI backend will be available at:

```text
http://127.0.0.1:8000
```

### Step 6: Start the Frontend

Open another terminal in the project root:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🖥️ Running the AI Agent Through CLI

The project also supports direct chest X-ray analysis through the command line.

Run:

```bash
python run_agent.py path/to/chest_xray.png
```

To generate and save a Grad-CAM heatmap:

```bash
python run_agent.py path/to/chest_xray.png --save-heatmap
```

To customize the decision threshold:

```bash
python run_agent.py path/to/chest_xray.png --threshold 0.45
```

## 🔬 Model Training and Evaluation

The project includes scripts for training and evaluating the DenseNet121 model.

**Train the model:**

```bash
python -m ai_agent.training.train --dataset-dir ai_agent/dataset --epochs 5
```

**Evaluate the model:**

```bash
python -m ai_agent.training.evaluate --checkpoint ai_agent/models_ckpt/tb_densenet121_best.pt --test-dir ai_agent/dataset/test --threshold 0.45
```

The repository also contains Windows batch scripts:
- `train_tb_model.bat`
- `evaluate_tb_model.bat`
- `start_backend.bat`

## 📊 Sample Output

The AI agent generates a screening report containing:

- Scan ID and timestamp
- TB prediction probability
- Prediction status
- Triage risk level
- Model confidence score
- Primary radiographic finding
- Lung zone spatial assessment
- Image quality metrics
- Clinical recommendations
- Grad-CAM visualization

## 🎯 Learning Outcomes

This project demonstrates practical applications of:

- Deep Learning and Convolutional Neural Networks.
- Transfer Learning using DenseNet121.
- Medical image classification and preprocessing.
- Explainable AI through Grad-CAM.
- Model training and evaluation.
- Building REST APIs using FastAPI.
- Integrating AI/ML models with React-based web applications.
- Developing interactive dashboards for AI-powered applications.

Screenshots <img width="1892" height="1005" alt="Screenshot 2026-10-16 164953" src="https://github.com/user-attachments/assets/0b000777-9d98-4132-8288-049e85e78e9b" /><img width="1892" height="1031" alt="Screenshot 2026-10-13 090055" src="https://github.com/user-attachments/assets/cdf377dd-5e68-492e-821a-8565eb1db5b8" />
<img width="1598" height="845" alt="Screenshot 2026-10-13 090407" src="https://github.com/user-attachments/assets/336d635a-426f-4c2c-84cd-289078ab6341" />
<img width="1906" height="1037" alt="Screenshot 2026-10-13 095249" src="https://github.com/user-attachments/assets/6c6c360a-cb33-48b9-938b-da0c2b0fe1c1" />



## 🚀 Future Enhancements

- Integration with larger and more diverse medical imaging datasets.
- Improved model performance and validation.
- Support for additional pulmonary conditions.
- Integration of patient medical history.
- Enhanced visualization and reporting features.
- Deployment as a cloud-based screening support application.

## ⚠️ Medical Disclaimer

This project is developed for educational and research purposes. Its predictions are AI-generated screening outputs and must not be considered a medical diagnosis. The system is not a replacement for professional medical evaluation, radiologist interpretation, or clinical testing. It is an assistant tool

## 👩‍💻 Author

Developed as an AI/ML project exploring the application of Deep Learning and Explainable AI in medical image analysis.

---

⭐ If you find this project interesting, consider giving the repository a star!
