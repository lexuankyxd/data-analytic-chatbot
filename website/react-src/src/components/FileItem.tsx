import { FileText } from "lucide-react"

const FileItem = ({ name, progress, size }) => {
  let unit = "mB";
  size /= 1024;
  if ((size / 1024) < 1) {
    unit = "kB";
  } else {
    size /= 1024;
  }
  size = Math.round(size * 100) / 100;
  return (<>
    <div className="bg-white shadow-lg p-3 rounded-lg flex items-center justify-between">
      <div className="flex items-center w-8/12">
        <FileText size={16} className="text-black mr-2" />
        <span className="text-black">{name}</span>
      </div>
      <span className="text-xs text-black w-1/12">{progress}%</span>
      <span className="text-xs text-black w-2/12">{size} {unit}</span>
    </div>
  </>);
}

export default FileItem;
