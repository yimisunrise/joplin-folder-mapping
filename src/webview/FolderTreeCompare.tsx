
// 定义树形节点组件
const TreeNode: React.FC<{ node: any }> = ({ node }) => {
  return (
      <li>
          <div onClick={() => {alert(node.label)}}>{node.label}</div>
          {/* 如果节点有子节点，则递归渲染子节点 */}
          {node.children && node.children.length > 0 && (
              <ul>
                  {node.children.map((child: any, index: number) => (
                      <TreeNode key={index} node={child} />
                  ))}
              </ul>
          )}
      </li>
  );
};

// 定义树形列表组件
const TreeList: React.FC<{ data: any[] }> = ({ data }) => {
  return (
      <ul>
          {data.map((node, index) => (
              <TreeNode key={index} node={node} />
          ))}
      </ul>
  );
};

// 定义左右树形列表数据
const leftTreeData = [
  {
      label: '节点1',
      children: [
          { label: '子节点1' },
          { label: '子节点2' }
      ]
  },
  { label: '节点2' }
];

const rightTreeData = [
  {
      label: '节点A',
      children: [
          { label: '子节点A1' },
          { label: '子节点A2' }
      ]
  },
  { label: '节点B' }
];

// 定义弹出窗口内容组件
const FolderTreeCompare: React.FC = () => {
  return (
      <div>
          <div className="tree-container">
              <div className="tree">
                  <h2>左侧树形列表</h2>
                  <TreeList data={leftTreeData} />
              </div>
              <div className="tree">
                  <h2>右侧树形列表</h2>
                  <TreeList data={rightTreeData} />
              </div>
          </div>
      </div>
  );
};

export default FolderTreeCompare;
